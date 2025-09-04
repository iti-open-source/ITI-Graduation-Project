import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Phone, PhoneOff, Trash2, ArrowLeft, UserPlus, UserMinus, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useRoomUpdates } from '@/hooks/use-room-updates';
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

interface QueueUser {
    id: number;
    position: number;
    joined_at: string;
    user: User;
}

interface Room {
    id: number;
    name: string;
    room_code: string;
    is_active: boolean;
    last_activity: string;
    current_participant: User | null;
    queue: QueueUser[];
    queue_count: number;
}

interface CreatorProps {
    room: Room;
}

export default function Creator({ room: initialRoom }: CreatorProps) {
    const [copied, setCopied] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const { room, isConnected } = useRoomUpdates(initialRoom.room_code, initialRoom);

    console.log(`[Creator] Initializing creator component for room ${room.room_code}, user ${auth.user.id}`);

    const {
        localVideoRef,
        remoteVideoRef,
        isVideoEnabled,
        isAudioEnabled,
        connectionStatus,
        toggleVideo,
        toggleAudio,
        createOffer,
        cleanup,
    } = useWebRTC({
        roomCode: room.room_code,
        userId: auth.user.id,
        isCreator: true,
    });

    const copyRoomLink = () => {
        const roomUrl = `${window.location.origin}/room/${room.room_code}`;
        navigator.clipboard.writeText(roomUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const joinUser = async (userId: number) => {
        console.log(`[Creator] Accepting user ${userId} and initiating WebRTC call`);

        try {
            // Get CSRF token from meta tag
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            console.log(`[Creator] CSRF Token:`, csrfToken ? 'Found' : 'Missing');

            const response = await fetch(`/room/${room.room_code}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    user_id: userId,
                }),
            });

            console.log(`[Creator] Response status: ${response.status}`);

            if (response.ok) {
                console.log(`[Creator] User ${userId} accepted, creating WebRTC offer in 1 second`);
                // Initiate WebRTC call after user is accepted
                setTimeout(() => {
                    console.log(`[Creator] Creating offer for user ${userId}`);
                    console.log(`[Creator] createOffer function:`, typeof createOffer);
                    createOffer(userId);
                    console.log(`[Creator] createOffer called for user ${userId}`);
                }, 1000); // Small delay to ensure the participant is ready
            } else {
                const errorText = await response.text();
                console.error(`[Creator] Failed to accept user ${userId}:`, response.status, errorText);
            }
        } catch (error) {
            console.error(`[Creator] Error accepting user ${userId}:`, error);
        }
    };

    const disconnectUser = () => {
        cleanup(); // Cleanup WebRTC connection
        router.post(`/room/${room.room_code}/disconnect`);
    };

    const deleteRoom = () => {
        if (confirm('Are you sure you want to delete this room?')) {
            router.delete(`/room/${room.room_code}`);
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Room: ${room.name}`} />

            <div className="container mx-auto px-4 py-8">
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                            >
                                <Link href="/lobby">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Lobby
                                </Link>
                            </Button>

                            <div>
                                <h1 className="text-3xl font-bold text-[var(--color-text)]">{room.name}</h1>
                                <p className="text-[var(--color-text-secondary)] mt-1">
                                    Room Code: {room.room_code}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    isConnected
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }
                            >
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </Badge>

                            <Button
                                onClick={copyRoomLink}
                                variant="outline"
                                className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>

                            <Button
                                onClick={deleteRoom}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Room
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Current Call */}
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                        >
                            <Card className="bg-[var(--color-card-bg)] border-[var(--color-card-shadow)]">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-text)] flex items-center gap-2">
                                        <Phone className="w-5 h-5" />
                                        Current Call
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
                                    </CardTitle>
                                    <CardDescription className="text-[var(--color-text-secondary)]">
                                        Manage your active video call
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {room.current_participant ? (
                                        <div className="space-y-4">
                                            {/* Video Container */}
                                            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                                                {/* Remote Video */}
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
                                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                                                <Avatar className="w-12 h-12">
                                                                    <AvatarFallback className="bg-gray-600 text-white text-lg">
                                                                        {room.current_participant.name.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                            <h3 className="text-lg font-semibold mb-2">
                                                                {room.current_participant.name}
                                                            </h3>
                                                            <p className="text-gray-400">
                                                                {connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for connection'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Local Video (Picture-in-Picture) */}
                                                <div className="absolute top-2 right-2 w-24 h-18 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                                                    <video
                                                        ref={localVideoRef}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {!isVideoEnabled && (
                                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                                            <VideoOff className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Call Controls */}
                                            <div className="flex items-center justify-center gap-4">
                                                <Button
                                                    onClick={toggleAudio}
                                                    size="sm"
                                                    className={`w-10 h-10 rounded-full ${isAudioEnabled
                                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                                        }`}
                                                >
                                                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                                </Button>

                                                <Button
                                                    onClick={toggleVideo}
                                                    size="sm"
                                                    className={`w-10 h-10 rounded-full ${isVideoEnabled
                                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                                        }`}
                                                >
                                                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                                </Button>

                                                <Button
                                                    onClick={disconnectUser}
                                                    size="sm"
                                                    className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    <PhoneOff className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Participant Info */}
                                            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarFallback className="bg-blue-100 text-blue-800">
                                                        {room.current_participant.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[var(--color-text)]">
                                                        {room.current_participant.name}
                                                    </h3>
                                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                                        {room.current_participant.email}
                                                    </p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800">
                                                    In Call
                                                </Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-section-alt-bg)] rounded-full flex items-center justify-center">
                                                <PhoneOff className="w-8 h-8 text-[var(--color-text-secondary)]" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                                                No Active Call
                                            </h3>
                                            <p className="text-[var(--color-text-secondary)]">
                                                Accept users from the queue to start a call
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Queue */}
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                        >
                            <Card className="bg-[var(--color-card-bg)] border-[var(--color-card-shadow)]">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-text)] flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Waiting Queue
                                        {room.queue_count > 0 && (
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                {room.queue_count}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-[var(--color-text-secondary)]">
                                        Users waiting to join your room
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {room.queue.length > 0 ? (
                                        <div className="space-y-3">
                                            {room.queue.map((queueItem) => (
                                                <div
                                                    key={queueItem.id}
                                                    className="flex items-center gap-4 p-3 bg-[var(--color-section-alt-bg)] rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-8 h-8 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {queueItem.position}
                                                        </div>
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback className="bg-gray-100 text-gray-800">
                                                                {queueItem.user.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-[var(--color-text)]">
                                                                {queueItem.user.name}
                                                            </h4>
                                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                                {queueItem.user.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => joinUser(queueItem.user.id)}
                                                        size="sm"
                                                        className="bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white"
                                                        disabled={!!room.current_participant}
                                                    >
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Accept
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-section-alt-bg)] rounded-full flex items-center justify-center">
                                                <Users className="w-8 h-8 text-[var(--color-text-secondary)]" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                                                No one waiting
                                            </h3>
                                            <p className="text-[var(--color-text-secondary)]">
                                                Share your room link to invite participants
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Room Link Card */}
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="mt-6"
                    >
                        <Card className="bg-[var(--color-card-bg)] border-[var(--color-card-shadow)]">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-text)]">Share Room Link</CardTitle>
                                <CardDescription className="text-[var(--color-text-secondary)]">
                                    Send this link to participants to join your room
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 p-3 bg-[var(--color-section-alt-bg)] rounded-lg">
                                    <code className="flex-1 text-sm text-[var(--color-text)]">
                                        {window.location.origin}/room/{room.room_code}
                                    </code>
                                    <Button
                                        onClick={copyRoomLink}
                                        size="sm"
                                        variant="outline"
                                        className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
