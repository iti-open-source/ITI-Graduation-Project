import { Link } from '@inertiajs/react';

export default function Footer(){
  return(
    <footer className="bg-[var(--color-footer-bg)] text-[var(--color-footer-text)] text-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mb-4">Powered by Laravel, React, and Inertia.js</p>
        <div className="flex justify-center space-x-4">
          <Link href="/privacy" className="hover:text-[var(--color-nav-text)]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--color-nav-text)]">Terms of Service</Link>
        </div>
        <p className="mt-4">© 2025 MockMate. All rights reserved.</p>
      </div>
    </footer>
  );
}