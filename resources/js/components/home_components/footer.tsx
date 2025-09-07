import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-[var(--color-footer-bg)] py-8 text-center text-[var(--color-footer-text)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="mb-4">Powered by Laravel, React, and Inertia.js</p>
                <div className="flex justify-center space-x-4">
                    <Link href="#" className="hover:text-[var(--color-nav-text)]">
                        Privacy Policy
                    </Link>
                    <Link href="#" className="hover:text-[var(--color-nav-text)]">
                        Terms of Service
                    </Link>
                </div>
                <p className="mt-4">© {new Date().getFullYear()} MockMate. All rights reserved.</p>
            </div>
        </footer>
    );
}
