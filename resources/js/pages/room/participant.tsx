import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useWebRTC } from '@/hooks/use-webrtc';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lobby',
        href: '/lobby',
    },
    {
        title: 'Room',
        href: '#',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface Room {
    id: number;
    name: string;
    room_code: string;
    is_active: boolean;
    last_activity: string;
    current_participant: User | null;
    creator?: User; // optional, used for display while connecting
    queue: any[];
    queue_count: number;
}

interface ParticipantProps {
    room: Room;
}

export default function Participant({ room }: ParticipantProps) {
    const [isLeaving, setIsLeaving] = useState(false);
    const { auth } = usePage<SharedData>().props;

    console.log(`[Participant] Initializing participant component for room ${room.room_code}, user ${auth.user.id}`);

    const {
        localVideoRef,
        remoteVideoRef,
        isConnected,
        isVideoEnabled,
        isAudioEnabled,
        connectionStatus,
        toggleVideo,
        toggleAudio,
        cleanup,
    } = useWebRTC({
        roomCode: room.room_code,
        userId: auth.user.id,
        isCreator: false,
    });

    const leaveCall = () => {
        setIsLeaving(true);
        cleanup();
        router.post(`/room/${room.room_code}/leave`);
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Video Call - ${room.name}`} />

            <div className="h-screen bg-black flex flex-col">
                {/* Header */}
                <div className="bg-[var(--color-nav-bg)] text-[var(--color-nav-text)] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-[var(--color-card-shadow)] text-[var(--color-nav-text)]"
                        >
                            <Link href="/lobby">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Lobby
                            </Link>
                        </Button>

                        <div>
                            <h1 className="text-lg font-semibold">{room.name}</h1>
                            <p className="text-sm opacity-75">Room Code: {room.room_code}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            className={
                                connectionStatus === 'connected'
                                    ? 'bg-green-100 text-green-800'
                                    : connectionStatus === 'connecting'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                            }
                        >
                            {connectionStatus === 'connected' ? 'Connected' :
                                connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                        </Badge>
                    </div>
                </div>

                {/* Video Container */}
                <div className="flex-1 relative bg-gray-900">
                    {/* Remote Video (Main) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {connectionStatus === 'connected' ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center text-white">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-gray-600 text-white text-xl">
                                            {room.creator?.name?.charAt(0)?.toUpperCase() || 'R'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {room.creator?.name || 'Room Owner'}
                                </h3>
                                <p className="text-gray-400">
                                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for connection'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                <VideoOff className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-[var(--color-nav-bg)] p-6">
                    <div className="flex items-center justify-center gap-4">
                        {/* Audio Toggle */}
                        <Button
                            onClick={toggleAudio}
                            size="lg"
                            className={`w-12 h-12 rounded-full ${isAudioEnabled
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>

                        {/* Video Toggle */}
                        <Button
                            onClick={toggleVideo}
                            size="lg"
                            className={`w-12 h-12 rounded-full ${isVideoEnabled
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>

                        {/* End Call */}
                        <Button
                            onClick={leaveCall}
                            size="lg"
                            disabled={isLeaving}
                            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isLeaving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <PhoneOff className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Code Editor Placeholder */}
                <div className="bg-[var(--color-nav-bg)] p-6 border-t border-[var(--color-card-shadow)]">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-3 flex items-center gap-2">
                            <Badge className="bg-[var(--color-section-alt-bg)] text-[var(--color-text-secondary)]">participant</Badge>
                            <span className="text-[var(--color-text-secondary)] text-sm">Code Editor (Placeholder)</span>
                        </div>
                        <div
                            aria-label="Code Editor Placeholder"
                            className="min-h-[200px] rounded-md border border-[var(--color-card-shadow)] bg-[var(--color-section-alt-bg)] font-mono text-sm p-4 text-[var(--color-text-secondary)]"
                        >
                            // Code editor will appear here.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
