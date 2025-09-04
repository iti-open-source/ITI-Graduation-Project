import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, Lock, Mail, Save, User, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'Edit User',
        href: '#',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface UserEditProps {
    user: User;
}

export default function UserEdit({ user }: UserEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                        <p className="text-muted-foreground">Update user information and settings</p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Edit User Information
                            </CardTitle>
                            <CardDescription>Update the user's account details and settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">Leave blank to keep the current password</p>
                                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                </div>

                                {/* Password Confirmation Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm new password"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                                </div>

                                {/* Current User Info */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <h4 className="mb-2 text-sm font-medium">Current Information</h4>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>
                                            <strong>User ID:</strong> #{user.id}
                                        </p>
                                        <p>
                                            <strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Last Updated:</strong> {new Date(user.updated_at).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Email Verified:</strong> {user.email_verified_at ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={`/admin/users/${user.id}`}>
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
