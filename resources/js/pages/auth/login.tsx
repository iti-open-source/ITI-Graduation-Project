import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';




interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>

            <AuthLayout title="Welcome Back 👋" description="Log in to access your account">
                <Head title="Log in" />

                <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                    {({ processing, errors }) => (
                        <>
                            {/* Continue with Google & LinkedIn */}
                            <Button
                                type="button"

                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--color-card-shadow)] 
               bg-[var(--color-section-alt-bg)]/70 text-sm font-medium text-[var(--color-text)] 
               shadow-lg transition-colors duration-200
               hover:bg-[var(--color-section-alt-bg)]/90 cursor-pointer"
                                onClick={() => {

                                    window.location.href = '/auth/google';
                                }}
                            >
                                <FcGoogle className="h-5 w-5" /> Continue with Google
                            </Button>
                            <Button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--color-card-shadow)] 
       bg-[#0077B5]/70 text-sm font-medium text-white 
       shadow-lg transition-colors duration-200 hover:bg-[#0077B5]/90 cursor-pointer"
                                onClick={() => {
                                    window.location.href = '/auth/linkedin';
                                }}
                            >
                                <FaLinkedin className="h-5 w-5" /> Continue with LinkedIn
                            </Button>
                            {/* <Button
                                type="button"
                                className=" w-full flex items-center justify-center gap-1 rounded-lg border border-[var(--color-card-shadow)] 
       bg-[#000]/70 py-3 text-sm font-medium text-white 
       shadow-lg transition-colors duration-200 hover:bg-[#0052]/90 cursor-pointer"
                                onClick={() => {
                                    window.location.href = '/auth/github';
                                }}
                            >
                                <FaGithub className="h-5 w-5" /> Continue with Github
                            </Button> */}

                            {/* Divider */}
                            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                                <span className="flex-1 border-t border-[var(--color-card-shadow)]"></span>
                                OR
                                <span className="flex-1 border-t border-[var(--color-card-shadow)]"></span>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[var(--color-text)]">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="rounded-lg border border-[var(--color-card-shadow)] text-[var(--color-text)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-[var(--color-text)]">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[var(--color-accent)] hover:underline"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="rounded-lg border border-[var(--color-card-shadow)] text-[var(--color-text)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-[var(--color-card-shadow)] data-[state=checked]:bg-[var(--color-accent)]"
                                />
                                <Label htmlFor="remember" className="text-[var(--color-text-secondary)]">
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full transform rounded-lg bg-[var(--color-button-primary-bg)] py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-[var(--color-button-primary-hover)]"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </>
                    )}
                </Form>

                <div className="my-8 border-t border-[var(--color-card-shadow)]"></div>

                <div className="text-center text-sm text-[var(--color-text-secondary)]">
                    Don’t have an account?{' '}
                    <TextLink href={register()} tabIndex={6} className="font-medium text-[var(--color-accent)] hover:underline">
                        Sign up
                    </TextLink>
                </div>

                {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
            </AuthLayout>
        </>
    );
}
