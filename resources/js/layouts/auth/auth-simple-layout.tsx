// import AppLogoIcon from '@/components/app-logo-icon';
import Navbar from '@/components/home_components/navbar';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
   return (
    <>
    <Navbar/>
    <div className="relative  min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-header-bg-start)] to-[var(--color-header-bg-end)] px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl backdrop-blur-xl bg-[var(--color-section-bg)]/80 border border-[var(--color-card-shadow)] p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Link
            href={home()}
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold text-lg">
             
              MM
            </div>
            <span className="sr-only">{title}</span>
          </Link>

        
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {title}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
    
    </>
    
  );
}
