import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import Navbar from '@/components/home_components/navbar';
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

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>
         <Navbar />
         <AuthLayout
        title="Welcome Back 👋"
        description="Log in to access your account"
      >
        <Head title="Log in" />

        <Form
          {...AuthenticatedSessionController.store.form()}
          resetOnSuccess={['password']}
          className="flex flex-col gap-6"
        >
          {({ processing, errors }) => (
            <>
            
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[var(--color-text)]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="email"
                  placeholder="email@example.com"
                  className="bg-[var(--color-section-alt-bg)]/70 border border-[var(--color-card-shadow)] focus:ring-2 focus:ring-[var(--color-accent)] rounded-lg"
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
                  className="bg-[var(--color-section-alt-bg)]/70 border border-[var(--color-card-shadow)] focus:ring-2 focus:ring-[var(--color-accent)] rounded-lg"
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
                <Label
                  htmlFor="remember"
                  className="text-[var(--color-text-secondary)]"
                >
                  Remember me
                </Label>
              </div>

             
              <Button
                type="submit"
                className="mt-4 w-full bg-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-hover)] text-white rounded-lg py-3 font-semibold transition transform hover:scale-[1.02] shadow-lg"
                tabIndex={4}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2 inline" />
                )}
                Log in
              </Button>
            </>
          )}
        </Form>

       
        <div className="my-8 border-t border-[var(--color-card-shadow)]"></div>

       
        <div className="text-center text-sm text-[var(--color-text-secondary)]">
          Don’t have an account?{' '}
          <TextLink
            href={register()}
            tabIndex={6}
            className="text-[var(--color-accent)] hover:underline font-medium"
          >
            Sign up
          </TextLink>
        </div>

      
        {status && (
          <div className="mt-4 text-center text-sm font-medium text-green-600">
            {status}
          </div>
        )}
      </AuthLayout>
        
        </>
       
    );
}
