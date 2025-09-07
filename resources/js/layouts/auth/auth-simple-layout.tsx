// import AppLogoIcon from '@/components/app-logo-icon';
import Navbar from "@/components/home_components/navbar";
import { home } from "@/routes";
import { Link } from "@inertiajs/react";
import { type PropsWithChildren } from "react";

interface AuthLayoutProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-header-bg-start)] to-[var(--color-header-bg-end)] px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--color-card-shadow)] bg-[var(--color-section-bg)]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-lg font-bold text-[var(--color-accent)]">
                MM
              </div>
              <span className="sr-only">{title}</span>
            </Link>

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-[var(--color-text)]">{title}</h1>
              <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </>
  );
}
