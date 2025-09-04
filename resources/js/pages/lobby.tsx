import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lobby',
        href: '/lobby',
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

interface LobbyProps {
    userRooms: Room[];
}

export default function Lobby({ userRooms }: LobbyProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const roomName = formData.get('name') as string;

        if (!roomName) return;

        setIsCreating(true);

        router.post('/rooms', {
            name: roomName,
        }, {
            onSuccess: () => {
                setShowCreateForm(false);
                setIsCreating(false);
            },
            onError: (errors) => {
                console.error('Room creation errors:', errors);
                setIsCreating(false);
            },
            onFinish: () => {
                setIsCreating(false);
            },
        });
    };

    const copyRoomLink = (roomCode: string) => {
        const roomUrl = `${window.location.origin}/room/${roomCode}`;
        navigator.clipboard.writeText(roomUrl);
        // You could add a toast notification here
    };

    const deleteRoom = (roomCode: string) => {
        if (confirm('Are you sure you want to delete this room?')) {
            router.delete(`/room/${roomCode}`);
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lobby" />

            <div className="container mx-auto px-4 py-8">
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-text)]">Interview Rooms</h1>
                            <p className="text-[var(--color-text-secondary)] mt-2">
                                Create and manage your interview rooms
                            </p>
                        </div>

                        <Button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Room
                        </Button>
                    </div>

                    {/* Create Room Form */}
                    {showCreateForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <Card className="bg-[var(--color-card-bg)] border-[var(--color-card-shadow)]">
                                <CardHeader>
                                    <CardTitle className="text-[var(--color-text)]">Create New Room</CardTitle>
                                    <CardDescription className="text-[var(--color-text-secondary)]">
                                        Create a new interview room and share the link with participants
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateRoom} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="roomName" className="text-[var(--color-text)]">
                                                Room Name
                                            </Label>
                                            <Input
                                                id="roomName"
                                                name="name"
                                                type="text"
                                                placeholder="Enter room name..."
                                                className="bg-[var(--color-section-alt-bg)]/70 border-[var(--color-card-shadow)] focus:ring-2 focus:ring-[var(--color-accent)]"
                                                required
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={isCreating}
                                                className="bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white"
                                            >
                                                {isCreating ? 'Creating...' : 'Create Room'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowCreateForm(false)}
                                                className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Rooms Grid */}
                    {userRooms.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {userRooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="bg-[var(--color-card-bg)] border-[var(--color-card-shadow)] hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-[var(--color-text)] text-lg">
                                                        {room.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-[var(--color-text-secondary)]">
                                                        Code: {room.room_code}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {room.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Current Participant */}
                                            {room.current_participant ? (
                                                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <Users className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm text-blue-800 dark:text-blue-200">
                                                        In call with: {room.current_participant.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <EyeOff className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        No active participant
                                                    </span>
                                                </div>
                                            )}

                                            {/* Queue */}
                                            {room.queue_count > 0 && (
                                                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <Users className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                                        {room.queue_count} user{room.queue_count !== 1 ? 's' : ''} in queue
                                                    </span>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="flex-1 bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white"
                                                >
                                                    <Link href={`/room/${room.room_code}`}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Enter Room
                                                    </Link>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => copyRoomLink(room.room_code)}
                                                    className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => deleteRoom(room.room_code)}
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            className="text-center py-12"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-section-alt-bg)] rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8 text-[var(--color-text-secondary)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                                    No rooms yet
                                </h3>
                                <p className="text-[var(--color-text-secondary)] mb-6">
                                    Create your first interview room to get started
                                </p>
                                <Button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Room
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
