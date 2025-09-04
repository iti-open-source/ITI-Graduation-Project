import { Link } from '@inertiajs/react';
import { useEffect, useState } from "react";

export default function Navbar() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav className="fixed top-0 w-full bg-[var(--color-nav-bg)] text-[var(--color-nav-text)] shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">MockMate</Link>
        <div className="flex items-center space-x-4">
      
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 ${
              theme === "light" ? "bg-yellow-300" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                theme === "light" ? "translate-x-1" : "translate-x-7"
              }`}
            />
          </button>

       
          <Link href="/login" className="hover:text-[var(--color-accent)] transition">Login</Link>
          <Link
            href="/register"
            className="bg-[var(--color-button-primary-bg)] px-4 py-2 rounded-lg hover:bg-[var(--color-button-primary-hover)] transform hover:scale-105 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
