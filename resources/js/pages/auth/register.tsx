import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { login } from "@/routes";
import { Form, Head } from "@inertiajs/react";
import { LoaderCircle, Plus, User } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Register() {
  const [preview, setPreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  function route(name: string): string {
    if (name === "register") return "/register";
    if (name === "login") return "/login";
    return "/";
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <Head title="Register" />

      {/* Form */}
      <Form
        method="post"
        action={route("register")}
        resetOnSuccess={["password", "password_confirmation"]}
        disableWhileProcessing
        className="flex flex-col gap-6"
        encType="multipart/form-data"
      >
        {({ processing, errors }) => (
          <>
            {/* Continue with Google */}
            <Button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                window.location.href = "/auth/google";
              }}
            >
              <FcGoogle className="h-5 w-5" /> Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex-1 border-t border-gray-300 dark:border-gray-700"></span>
              OR
              <span className="flex-1 border-t border-gray-300 dark:border-gray-700"></span>
            </div>
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center gap-2">
              <Label
                htmlFor="avatar"
                className="group relative flex cursor-pointer flex-col items-center"
              >
                <div className="mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100 text-gray-500 shadow-inner transition group-hover:ring-2 group-hover:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10" />
                  )}
                  <input
                    id="avatar"
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Plus icon overlay */}
                <div className="absolute right-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition group-hover:scale-110 dark:bg-blue-500">
                  <Plus className="h-4 w-4" />
                </div>
              </Label>
              <InputError message={errors.photo} className="mt-2" />
            </div>

            {/* Fields */}
            <div className="grid gap-6">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-800 dark:text-gray-200">
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
                  className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
                <InputError message={errors.name} className="mt-2" />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">
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
                  className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
                <InputError message={errors.email} />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-800 dark:text-gray-200">
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
                  className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
                <InputError message={errors.password} />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="password_confirmation" className="text-gray-800 dark:text-gray-200">
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
                  className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
                <InputError message={errors.password_confirmation} />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="mt-2 w-full transform rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02] hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
                tabIndex={5}
                disabled={processing}
              >
                {processing && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </div>

            {/* Already have account */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <TextLink
                href={login()}
                tabIndex={6}
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  );
}
