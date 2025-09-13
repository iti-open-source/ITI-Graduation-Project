import AuthenticatedSessionController from "@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController";
import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { register } from "@/routes";
import { request } from "@/routes/password";
import { Form, Head } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  return (
    <AuthLayout title="Welcome Back 👋" description="Log in to access your account">
      <Head title="Log in" />

      <Form
        {...AuthenticatedSessionController.store.form()}
        resetOnSuccess={["password"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            {/* Continue with Google & LinkedIn */}
            <Button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                window.location.href = "/auth/google";
              }}
            >
              <FcGoogle className="h-5 w-5" /> Continue with Google
            </Button>

            <Button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0077B5] bg-[#0077B5] text-sm font-medium text-white shadow-md transition hover:bg-[#005f91]"
              onClick={() => {
                window.location.href = "/auth/linkedin";
              }}
            >
              <FaLinkedin className="h-5 w-5" /> Continue with LinkedIn
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex-1 border-t border-gray-300 dark:border-gray-700"></span>
              OR
              <span className="flex-1 border-t border-gray-300 dark:border-gray-700"></span>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">
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
                className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <InputError message={errors.email} />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-gray-800 dark:text-gray-200">
                  Password
                </Label>
                {canResetPassword && (
                  <TextLink
                    href={request()}
                    className="ml-auto text-sm text-blue-600 hover:underline dark:text-blue-400"
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
                className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <InputError message={errors.password} />
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember"
                name="remember"
                tabIndex={3}
                className="border-gray-300 data-[state=checked]:bg-blue-600 dark:border-gray-600"
              />
              <Label htmlFor="remember" className="text-gray-600 dark:text-gray-400">
                Remember me
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-4 w-full transform rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02] hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              tabIndex={4}
              disabled={processing}
            >
              {processing && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />}
              Log in
            </Button>
          </>
        )}
      </Form>

      {/* Divider */}
      <div className="my-8 border-t border-gray-300 dark:border-gray-700"></div>

      {/* Sign up link */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don’t have an account?{" "}
        <TextLink
          href={register()}
          tabIndex={6}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Sign up
        </TextLink>
      </div>

      {status && (
        <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
          {status}
        </div>
      )}
    </AuthLayout>
  );
}
