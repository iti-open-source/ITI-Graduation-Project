import Pusher from 'pusher-js';
import { useCallback, useEffect, useRef, useState } from 'react';

interface WebRTCConfig {
    roomCode: string;
    userId: number;
    isCreator: boolean;
}

interface SignalingData {
    type: 'offer' | 'answer' | 'ice-candidate';
    data: any;
    fromUserId: number;
    toUserId?: number;
}

export function useWebRTC({ roomCode, userId, isCreator }: WebRTCConfig) {
    const [isConnected, setIsConnected] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const pusherRef = useRef<Pusher | null>(null);
    const channelRef = useRef<any>(null);
    const iceCandidateQueueRef = useRef<RTCIceCandidate[]>([]);
    const isInitializedRef = useRef(false);
    const initializationPromiseRef = useRef<Promise<void> | null>(null);

    const sendSignalingData = useCallback(
        async (type: string, data: any, toUserId?: number) => {
            try {
                console.log(`[WebRTC] Sending ${type} to user ${toUserId || 'all'}:`, data);
                const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                const response = await fetch(`/room/${roomCode}/signaling`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        type,
                        data,
                        to_user_id: toUserId,
                    }),
                });

                if (!response.ok) {
                    console.error(`[WebRTC] Signaling request failed: ${response.status} ${response.statusText}`);
                } else {
                    console.log(`[WebRTC] Signaling ${type} sent successfully`);
                }
            } catch (error) {
                console.error('Error sending signaling data:', error);
            }
        },
        [roomCode],
    );

    const initializeWebRTC = useCallback(async () => {
        if (isInitializedRef.current) {
            console.log(`[WebRTC] Already initialized, skipping for user ${userId}`);
            return;
        }

        if (initializationPromiseRef.current) {
            console.log(`[WebRTC] Initialization in progress, waiting for completion for user ${userId}`);
            return initializationPromiseRef.current;
        }

        try {
            console.log(`[WebRTC] Initializing WebRTC for user ${userId}, isCreator: ${isCreator}, roomCode: ${roomCode}`);
            isInitializedRef.current = true;

            // Create a promise to track initialization
            initializationPromiseRef.current = (async () => {
                // Get user media
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                console.log('[WebRTC] Got user media stream:', stream);

                localStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Create peer connection with Google STUN servers
                const peerConnection = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                    ],
                });

                peerConnectionRef.current = peerConnection;

                // Add local stream to peer connection
                stream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, stream);
                });

                // Handle remote stream
                peerConnection.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // Handle ICE candidates
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('[WebRTC] ICE candidate generated:', event.candidate);
                        sendSignalingData('ice-candidate', event.candidate);
                    } else {
                        console.log('[WebRTC] ICE gathering complete');
                    }
                };

                // Handle connection state changes
                peerConnection.onconnectionstatechange = () => {
                    const state = peerConnection.connectionState;
                    console.log(`[WebRTC] Connection state changed: ${state}`);
                    if (state === 'connected') {
                        setConnectionStatus('connected');
                        setIsConnected(true);
                    } else if (state === 'disconnected' || state === 'failed') {
                        setConnectionStatus('disconnected');
                        setIsConnected(false);
                    }
                };

                // Handle ICE connection state changes
                peerConnection.oniceconnectionstatechange = () => {
                    const state = peerConnection.iceConnectionState;
                    console.log(`[WebRTC] ICE connection state changed: ${state}`);
                    if (state === 'connected') {
                        setConnectionStatus('connected');
                        setIsConnected(true);
                    } else if (state === 'disconnected' || state === 'failed') {
                        setConnectionStatus('disconnected');
                        setIsConnected(false);
                    }
                };

                // Initialize Pusher for signaling
                console.log('[WebRTC] Initializing Pusher with key:', import.meta.env.VITE_PUSHER_APP_KEY);
                const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || 'your-pusher-key', {
                    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'us2',
                    forceTLS: true,
                });

                pusherRef.current = pusher;

                const channel = pusher.subscribe(`room.${roomCode}`);
                channelRef.current = channel;
                console.log(`[WebRTC] Subscribed to channel: room.${roomCode}`);

                // Handle incoming signaling data
                channel.bind('webrtc-signaling', (data: SignalingData) => {
                    console.log(`[WebRTC] Received signaling:`, data);
                    // Ignore our own messages
                    if (data.fromUserId === userId) {
                        console.log(`[WebRTC] Ignoring own message from user ${userId}`);
                        return;
                    }
                    // Respect targeted messages (only process if addressed to me or broadcast)
                    if (data.toUserId && data.toUserId !== userId) {
                        console.log(`[WebRTC] Message not for me (${userId}), target: ${data.toUserId}`);
                        return;
                    }

                    console.log(`[WebRTC] Processing ${data.type} from user ${data.fromUserId}`);
                    handleSignalingData(data);
                });

                setConnectionStatus('connecting');
            })();

            await initializationPromiseRef.current;
        } catch (error) {
            console.error('Error initializing WebRTC:', error);
            setConnectionStatus('disconnected');
            isInitializedRef.current = false;
            initializationPromiseRef.current = null;
        }
    }, [roomCode, userId, sendSignalingData]);

    const cleanSDP = useCallback((sdp: string) => {
        // Create a minimal, valid SDP by extracting only essential parts
        const lines = sdp.split('\n');
        const essentialLines: string[] = [];

        // Keep essential SDP headers
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Keep version, origin, session name, timing
            if (/^[vost]=/.test(trimmed)) {
                essentialLines.push(trimmed);
            }
            // Keep media descriptions (m=)
            else if (trimmed.startsWith('m=')) {
                essentialLines.push(trimmed);
            }
            // Keep connection info (c=)
            else if (trimmed.startsWith('c=')) {
                essentialLines.push(trimmed);
            }
            // Keep essential attributes
            else if (trimmed.startsWith('a=')) {
                const attr = trimmed.substring(2);

                // Keep critical WebRTC attributes
                if (
                    attr.startsWith('group:BUNDLE') ||
                    attr.startsWith('ice-ufrag:') ||
                    attr.startsWith('ice-pwd:') ||
                    attr.startsWith('ice-options:') ||
                    attr.startsWith('fingerprint:') ||
                    attr.startsWith('setup:') ||
                    attr.startsWith('mid:') ||
                    attr === 'sendrecv' ||
                    attr === 'rtcp-mux' ||
                    attr.startsWith('rtpmap:') ||
                    attr.startsWith('fmtp:')
                ) {
                    essentialLines.push(trimmed);
                }
            }
        }

        console.log('[WebRTC] Cleaned SDP from', lines.length, 'lines to', essentialLines.length, 'essential lines');
        return essentialLines.join('\n');
    }, []);

    const processQueuedIceCandidates = useCallback(async () => {
        if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
            return;
        }

        console.log(`[WebRTC] Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`);

        while (iceCandidateQueueRef.current.length > 0) {
            const candidate = iceCandidateQueueRef.current.shift();
            if (candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(candidate);
                    console.log('[WebRTC] Added queued ICE candidate');
                } catch (error) {
                    console.error('[WebRTC] Error adding queued ICE candidate:', error);
                }
            }
        }
    }, []);

    const handleSignalingData = useCallback(
        async (data: SignalingData) => {
            if (!peerConnectionRef.current) {
                console.log('[WebRTC] No peer connection available, ignoring signaling data');
                return;
            }

            try {
                console.log(`[WebRTC] Handling ${data.type}:`, data.data);
                switch (data.type) {
                    case 'offer':
                        console.log('[WebRTC] Setting remote description (offer)');
                        try {
                            // Clean the SDP before creating the session description
                            const cleanedSDP = cleanSDP(data.data.sdp);
                            const cleanedOffer = {
                                type: data.data.type,
                                sdp: cleanedSDP,
                            };
                            const offer = new RTCSessionDescription(cleanedOffer);
                            console.log('[WebRTC] Valid offer received:', offer.type);
                            await peerConnectionRef.current.setRemoteDescription(offer);
                            console.log('[WebRTC] Creating answer');
                            const answer = await peerConnectionRef.current.createAnswer();
                            console.log('[WebRTC] Setting local description (answer)');
                            await peerConnectionRef.current.setLocalDescription(answer);
                            console.log('[WebRTC] Sending answer back');
                            sendSignalingData('answer', answer, data.fromUserId);
                            // Process any queued ICE candidates
                            await processQueuedIceCandidates();
                        } catch (error) {
                            console.error('[WebRTC] Error processing offer:', error);
                            console.log('[WebRTC] Raw offer data:', data.data);
                        }
                        break;

                    case 'answer':
                        console.log('[WebRTC] Setting remote description (answer)');
                        try {
                            // Clean the SDP before creating the session description
                            const cleanedSDP = cleanSDP(data.data.sdp);
                            const cleanedAnswer = {
                                type: data.data.type,
                                sdp: cleanedSDP,
                            };
                            const answer = new RTCSessionDescription(cleanedAnswer);
                            console.log('[WebRTC] Valid answer received:', answer.type);
                            await peerConnectionRef.current.setRemoteDescription(answer);
                            // Process any queued ICE candidates
                            await processQueuedIceCandidates();
                        } catch (error) {
                            console.error('[WebRTC] Error processing answer:', error);
                            console.log('[WebRTC] Raw answer data:', data.data);
                        }
                        break;

                    case 'ice-candidate':
                        console.log('[WebRTC] Handling ICE candidate');
                        try {
                            // Validate ICE candidate
                            const candidate = new RTCIceCandidate(data.data);
                            console.log('[WebRTC] Valid ICE candidate received');
                            if (peerConnectionRef.current.remoteDescription) {
                                console.log('[WebRTC] Adding ICE candidate immediately');
                                await peerConnectionRef.current.addIceCandidate(candidate);
                            } else {
                                console.log('[WebRTC] Queuing ICE candidate (no remote description yet)');
                                iceCandidateQueueRef.current.push(candidate);
                            }
                        } catch (error) {
                            console.error('[WebRTC] Error processing ICE candidate:', error);
                            console.log('[WebRTC] Raw ICE candidate data:', data.data);
                        }
                        break;
                }
            } catch (error) {
                console.error('Error handling signaling data:', error);
            }
        },
        [sendSignalingData, processQueuedIceCandidates, cleanSDP],
    );

    const createOffer = useCallback(
        async (toUserId?: number) => {
            if (!peerConnectionRef.current) {
                console.log('[WebRTC] No peer connection available for creating offer');
                return;
            }

            if (peerConnectionRef.current.signalingState === 'closed') {
                console.log('[WebRTC] Peer connection is closed, cannot create offer');
                return;
            }

            try {
                console.log(`[WebRTC] Creating offer for user ${toUserId || 'all'}, signaling state: ${peerConnectionRef.current.signalingState}`);
                const offer = await peerConnectionRef.current.createOffer();
                console.log('[WebRTC] Setting local description (offer)');
                await peerConnectionRef.current.setLocalDescription(offer);
                console.log('[WebRTC] Sending offer');
                sendSignalingData('offer', offer, toUserId);
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        },
        [sendSignalingData],
    );

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, []);

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, []);

    const cleanup = useCallback(() => {
        console.log(`[WebRTC] Cleaning up WebRTC for user ${userId}`);
        isInitializedRef.current = false;
        initializationPromiseRef.current = null;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        if (channelRef.current) {
            channelRef.current.unbind_all();
        }

        if (pusherRef.current) {
            pusherRef.current.disconnect();
        }
    }, [userId]);

    useEffect(() => {
        initializeWebRTC();

        return () => {
            cleanup();
        };
    }, [initializeWebRTC, cleanup]);

    return {
        localVideoRef,
        remoteVideoRef,
        isConnected,
        isVideoEnabled,
        isAudioEnabled,
        connectionStatus,
        toggleVideo,
        toggleAudio,
        createOffer,
        cleanup,
    };
}
