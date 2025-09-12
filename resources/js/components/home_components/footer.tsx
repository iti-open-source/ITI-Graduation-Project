import { Link } from "@inertiajs/react";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden 
      bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 
      dark:from-slate-900 dark:via-blue-900 dark:to-indigo-800"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/apple-touch-icon.png" alt="Logo" className="w-6 h-6" />
              <span className="text-primary font-semibold uppercase tracking-wider">
                MockMate
              </span>
            </div>
            <p className="text-sm text-foreground/70 dark:text-white/70">
              Smarter interview rooms for institutes and professionals — built with
              Laravel, React & Inertia.js.
            </p>
          </div>

          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-2 text-foreground/70 dark:text-white/70">
              <li>
                <Link
                  href="#home"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-foreground/70 dark:text-white/70">
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground dark:hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

      
        <div className="border-t border-border dark:border-white/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <p className="text-foreground/70 dark:text-white/70 text-sm">
            © {new Date().getFullYear()} MockMate. All rights reserved.
          </p>
          <p className="text-foreground/70 dark:text-white/70 text-sm mt-2 md:mt-0">
            Powered by Laravel, React & Inertia.js
          </p>
        </div>
      </div>
    </footer>
  );
}
