import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomUpdates } from '@/hooks/use-room-updates';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Loader2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface QueueProps {
    room: Room;
    queuePosition: number;
    queueEntry: QueueUser;
}

export default function Queue({ room: initialRoom, queuePosition: initialQueuePosition, queueEntry: initialQueueEntry }: QueueProps) {
    const [timeInQueue, setTimeInQueue] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);
    const { room, isConnected } = useRoomUpdates(initialRoom.room_code, initialRoom);

    // Find current queue position from updated room data
    const currentQueueEntry = room.queue.find((q) => q.user?.id === initialQueueEntry?.user?.id);
    const queuePosition = currentQueueEntry?.position || initialQueuePosition;

    useEffect(() => {
        if (!initialQueueEntry?.joined_at) return;

        const interval = setInterval(() => {
            const joinedAt = new Date(initialQueueEntry.joined_at);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - joinedAt.getTime()) / 1000);
            setTimeInQueue(diffInSeconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [initialQueueEntry?.joined_at]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const leaveQueue = () => {
        setIsLeaving(true);
        router.post(`/room/${room.room_code}/leave`);
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const pulse = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Waiting in Queue - ${room.name}`} />

            <div className="container mx-auto px-4 py-8">
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <Button asChild variant="outline" size="sm" className="border-[var(--color-card-shadow)] text-[var(--color-text)]">
                            <Link href="/lobby">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Lobby
                            </Link>
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="mb-8 text-center">
                        <motion.div
                            variants={pulse}
                            animate="animate"
                            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-accent)]"
                        >
                            <Users className="h-12 w-12 text-white" />
                        </motion.div>

                        <h1 className="mb-4 text-3xl font-bold text-[var(--color-text)]">Waiting in Queue</h1>

                        <p className="mb-2 text-lg text-[var(--color-text-secondary)]">
                            You're waiting to join <strong>{room.name}</strong>
                        </p>

                        <p className="text-[var(--color-text-secondary)]">The room owner will accept you when they're ready</p>
                    </div>

                    {/* Queue Status Card */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
                        <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                            <CardHeader>
                                <CardTitle className="text-center text-[var(--color-text)]">Your Position in Queue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-center">
                                    <div className="text-6xl font-bold text-[var(--color-accent)]">#{queuePosition}</div>

                                    <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                                        <Clock className="h-4 w-4" />
                                        <span>Waiting for {formatTime(timeInQueue)}</span>
                                    </div>

                                    {room.queue_count > 1 && (
                                        <div className="text-sm text-[var(--color-text-secondary)]">
                                            {room.queue_count - 1} other{room.queue_count - 1 !== 1 ? 's' : ''} waiting
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Room Info Card */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
                        <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-text)]">Room Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Room Name:</span>
                                    <span className="font-medium text-[var(--color-text)]">{room.name}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Room Code:</span>
                                    <Badge variant="outline" className="font-mono">
                                        {room.room_code}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Status:</span>
                                    <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Current Call Status */}
                    {room.current_participant && (
                        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
                            <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-text)]">Current Call</CardTitle>
                                    <CardDescription className="text-[var(--color-text-secondary)]">
                                        The room owner is currently in a call
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                                        <span className="text-sm text-blue-800 dark:text-blue-200">In call with {room.current_participant.name}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Loading Animation */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Waiting for room owner to accept...</span>
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2">
                            <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </Badge>
                        </div>
                    </motion.div>

                    {/* Leave Queue Button */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="text-center">
                        <Button onClick={leaveQueue} variant="outline" disabled={isLeaving} className="border-red-200 text-red-600 hover:bg-red-50">
                            {isLeaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Leaving...
                                </>
                            ) : (
                                'Leave Queue'
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
