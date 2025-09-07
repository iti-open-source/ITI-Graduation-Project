import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomUpdates } from '@/hooks/use-room-updates';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

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

    // Lobby only: no in-lobby WebRTC

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
                const result = await response.json();
                const sessionCode = result.sessionCode || room.room_code;
                console.log(`[Creator] User ${userId} accepted, redirecting to session ${sessionCode}`);
                window.location.href = `/session/${sessionCode}`;
            } else {
                const errorText = await response.text();
                console.error(`[Creator] Failed to accept user ${userId}:`, response.status, errorText);
            }
        } catch (error) {
            console.error(`[Creator] Error accepting user ${userId}:`, error);
        }
    };

    const disconnectUser = () => {
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
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" size="sm" className="border-[var(--color-card-shadow)] text-[var(--color-text)]">
                                <Link href="/lobby">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Lobby
                                </Link>
                            </Button>

                            <div>
                                <h1 className="text-3xl font-bold text-[var(--color-text)]">{room.name}</h1>
                                <p className="mt-1 text-[var(--color-text-secondary)]">Room Code: {room.room_code}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </Badge>

                            <Button onClick={copyRoomLink} variant="outline" className="border-[var(--color-card-shadow)] text-[var(--color-text)]">
                                <Copy className="mr-2 h-4 w-4" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>

                            <Button onClick={deleteRoom} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Room
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Queue */}
                        <motion.div variants={fadeIn} initial="hidden" animate="visible">
                            <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[var(--color-text)]">
                                        <Users className="h-5 w-5" />
                                        Waiting Queue
                                        {room.queue_count > 0 && <Badge className="bg-yellow-100 text-yellow-800">{room.queue_count}</Badge>}
                                    </CardTitle>
                                    <CardDescription className="text-[var(--color-text-secondary)]">Users waiting to join your room</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {room.queue.length > 0 ? (
                                        <div className="space-y-3">
                                            {room.queue.map((queueItem) => (
                                                <div
                                                    key={queueItem.id}
                                                    className="flex items-center gap-4 rounded-lg bg-[var(--color-section-alt-bg)] p-3"
                                                >
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
                                                            {queueItem.position}
                                                        </div>
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-gray-100 text-gray-800">
                                                                {queueItem.user.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-[var(--color-text)]">{queueItem.user.name}</h4>
                                                            <p className="text-sm text-[var(--color-text-secondary)]">{queueItem.user.email}</p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => joinUser(queueItem.user.id)}
                                                        size="sm"
                                                        className="bg-[var(--color-button-primary-bg)] text-white hover:bg-[var(--color-button-primary-hover)]"
                                                        disabled={false}
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Accept
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-section-alt-bg)]">
                                                <Users className="h-8 w-8 text-[var(--color-text-secondary)]" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">No one waiting</h3>
                                            <p className="text-[var(--color-text-secondary)]">Share your room link to invite participants</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Active Sessions */}
                        <motion.div variants={fadeIn} initial="hidden" animate="visible">
                            <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[var(--color-text)]">
                                        Active Sessions
                                        {Array.isArray((room as any).sessions) && (room as any).sessions.length > 0 && (
                                            <Badge className="bg-green-100 text-green-800">{(room as any).sessions.length}</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-[var(--color-text-secondary)]">
                                        Ongoing sessions created from this lobby
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {Array.isArray((room as any).sessions) && (room as any).sessions.length > 0 ? (
                                        <div className="space-y-3">
                                            {(room as any).sessions.map((s: any) => (
                                                <div
                                                    key={s.id}
                                                    className="flex items-center justify-between rounded-lg bg-[var(--color-section-alt-bg)] p-3"
                                                >
                                                    <div>
                                                        <div className="font-medium text-[var(--color-text)]">Session: {s.session_code}</div>
                                                        <div className="text-sm text-[var(--color-text-secondary)]">Status: {s.status}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-blue-100 text-blue-800">active</Badge>
                                                        <Button asChild size="sm" variant="outline" className="border-[var(--color-card-shadow)]">
                                                            <a href={`/session/${s.session_code}`}>Open</a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-[var(--color-text-secondary)]">No active sessions</div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Room Link Card */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mt-6">
                        <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-text)]">Share Room Link</CardTitle>
                                <CardDescription className="text-[var(--color-text-secondary)]">
                                    Send this link to participants to join your room
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 rounded-lg bg-[var(--color-section-alt-bg)] p-3">
                                    <code className="flex-1 text-sm text-[var(--color-text)]">
                                        {window.location.origin}/room/{room.room_code}
                                    </code>
                                    <Button
                                        onClick={copyRoomLink}
                                        size="sm"
                                        variant="outline"
                                        className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Lobby only; editor removed */}
                </motion.div>
            </div>
        </AppLayout>
    );
}
