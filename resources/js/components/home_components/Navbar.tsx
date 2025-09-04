import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <nav className="sticky top-0 z-50 w-full bg-[var(--color-nav-bg)] text-[var(--color-nav-text)] shadow-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-2xl font-bold">
                    MockMate
                </Link>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className={`relative flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${
                            theme === 'light' ? 'bg-yellow-300' : 'bg-gray-600'
                        }`}
                    >
                        <span
                            className={`absolute h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                theme === 'light' ? 'translate-x-1' : 'translate-x-7'
                            }`}
                        />
                    </button>

                    <Link href="/login" className="transition hover:text-[var(--color-accent)]">
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="transform rounded-lg bg-[var(--color-button-primary-bg)] px-4 py-2 transition hover:scale-105 hover:bg-[var(--color-button-primary-hover)]"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
}
