import AppearanceToggleDropdown from "@/components/appearance-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuContent } from "@/components/user-menu-content";
import { useInitials } from "@/hooks/use-initials";
import { Link, usePage } from "@inertiajs/react";
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const page = usePage();
  const { auth } = page.props as any;
  const getInitials = useInitials();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = auth?.user;
  const isAuthenticated = !!user;

  const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
  ...(isAuthenticated ? [{ href: "/dashboard", label: "Dashboard" }] : []),
];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-sidebar/80 backdrop-blur-sm text-sidebar-foreground shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img src="/apple-touch-icon.png" alt="Logo" className="size-8" />
            <span className="text-lg font-bold">MockMate</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative inline-block text-foreground after:content-[''] after:absolute after:w-0 after:h-[3px] after:left-0 after:-bottom-1 after:bg-blue-500 after:transition-all after:duration-500 hover:after:w-full"

              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <AppearanceToggleDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="size-10 rounded-full p-1 hover:bg-muted"
                    >
                      <Avatar className="size-8 overflow-hidden rounded-full">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                          {getInitials(user?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={user} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border bg-sidebar px-4 py-3 space-y-3"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
