import { Link ,usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { User, Settings, LogOut, Users, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {


    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const { auth } = usePage().props as any;
    const user = auth?.user;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    {!isLoggedIn && (
                        <>
                            <Link href="/login" className="transition hover:text-[var(--color-accent)]">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="transform rounded-lg bg-[var(--color-button-primary-bg)] px-4 py-2 transition hover:scale-105 hover:bg-[var(--color-button-primary-hover)]"
                            >
                                Register
                            </Link>
                        </>
                    )}
                    {/* {isLoggedIn && (
                        <Link href="/logout" method="post" className="transition hover:text-[var(--color-accent)]">
                            Logout
                        </Link>
                    )} */}

                   {isLoggedIn && (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
                                {user?.avatar ? (
                                    <img
                                        src={`/storage/${user.avatar}`}
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-800 dark:text-gray-200">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
                                    >
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                            {user?.avatar ? (
                                                <img
                                                    src={`/storage/${user.avatar}`}
                                                    alt={user.name}
                                                    className="h-12 w-12 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-lg text-gray-800 dark:text-gray-200">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                            </div>
                                        </div>

                                        {/* Menu items */}
                                        <div className="p-2">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <User className="h-4 w-4" /> Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <Settings className="h-4 w-4" /> Account settings
                                            </Link>

                                            {/* Theme toggle inside menu */}
                                            <button
                                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                                className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Monitor className="h-4 w-4" /> Theme
                                                </span>
                                                <div
                                                    className={`relative flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${
                                                        theme === 'light' ? 'bg-yellow-300' : 'bg-gray-600'
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                                            theme === 'light' ? 'translate-x-1' : 'translate-x-5'
                                                        }`}
                                                    />
                                                </div>
                                            </button>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                        {/* Bottom links */}
                                        <div className="p-2">
                                            <Link
                                                href="/switch-account"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <Users className="h-4 w-4" /> Switch account
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                <LogOut className="h-4 w-4" /> Log out
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}


                     {/* {isLoggedIn && (
                        <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                                <img
                                    src={`/storage/${user.avatar}`}
                                    alt={user.name}
                                    className="h-12 w-12 rounded-full object-cover border border-gray-300"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            
                        </div>
                    )} */}
                </div>
            </div>
        </nav>
    );
}
