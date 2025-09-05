import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import Navbar from '@/components/home_components/navbar';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    function route(name: string): string {
        // Simple implementation for demonstration purposes
        // In a real app, use Ziggy or your routing library
        if (name === 'register') return '/register';
        if (name === 'login') return '/login';
        return '/';
    }
    return (
        <>
            <Navbar />

            <AuthLayout title="Create an account" description="Enter your details below to create your account">
                <Head title="Register" />

                {/* Form */}
                <Form
                    // {...RegisteredUserController.store.form()}
                    method="post"
    action={route('register')}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-[var(--color-text)]">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Full name"
                                        className="rounded-lg border border-[var(--color-card-shadow)] text-[var(--color-text)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-[var(--color-text)]">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className="rounded-lg border border-[var(--color-card-shadow)] text-[var(--color-text)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-[var(--color-text)]">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="rounded-lg border border-[var(--color-card-shadow)] text-[var(--color-text)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation" className="text-[var(--color-text)]">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        className="rounded-lg border border-[var(--color-card-shadow)] text-[var(--color-text)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full transform rounded-lg bg-[var(--color-button-primary-bg)] py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[var(--color-button-primary-hover)]"
                                    tabIndex={5}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </div>

                            <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
                                Already have an account?{' '}
                                <TextLink href={login()} tabIndex={6} className="font-medium text-[var(--color-accent)] hover:underline">
                                    Log in
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </AuthLayout>
        </>
    );
}
