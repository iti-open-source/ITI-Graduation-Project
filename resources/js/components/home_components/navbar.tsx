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
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const page = usePage();
  const { auth } = page.props as any;
  const getInitials = useInitials();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUrl = page.url;

  const user = auth?.user;
  const isAuthenticated = !!user;
  const [activeSection, setActiveSection] = useState<string>("home");
  const shouldHighlight = !currentUrl.startsWith("/login") && !currentUrl.startsWith("/register");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    sections.forEach((sec) => observer.observe(sec));

    // 👇 Fix: when scroll at top, force "home"
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#features", label: "Features" },
    // { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
    ...(isAuthenticated && user?.role === "admin" || user?.role === "instructor" ? [{ href: "/dashboard", label: "Dashboard" }] : user?.role === "student" ? [{ href: "/dashboard", label: "Profile" }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-sidebar/80 text-sidebar-foreground shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <img src="/apple-touch-icon.png" alt="Logo" className="size-8" />
            <span className="text-lg font-bold">MockMate</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-block transition ${
                  shouldHighlight && activeSection === link.href.replace("#", "")
                    ? "font-semibold text-primary after:w-full"
                    : "text-foreground after:w-0"
                } after:absolute after:-bottom-1 after:left-0 after:h-[3px] after:bg-blue-500 after:transition-all after:duration-500 after:content-['']`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <div className="hidden items-center gap-3 md:flex">
                <AppearanceToggleDropdown />

                {/* Login button */}
                <Button variant={currentUrl.startsWith("/login") ? "default" : "ghost"} asChild>
                  <Link
                    href="/login"
                    className={`${
                      currentUrl.startsWith("/login")
                        ? "bg-primary text-white hover:bg-primary/90 dark:text-black"
                        : "border:black border text-foreground dark:text-foreground"
                    }`}
                  >
                    Login
                  </Link>
                </Button>

                {/* Register button */}
                <Button
                  variant={currentUrl.startsWith("/register") ? "default" : "secondary"}
                  asChild
                >
                  <Link
                    href="/register"
                    className={`${
                      currentUrl.startsWith("/register")
                        ? "bg-primary text-white hover:bg-primary/90 dark:text-black"
                        : "text-foreground dark:text-foreground"
                    }`}
                  >
                    Register
                  </Link>
                </Button>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <AppearanceToggleDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-10 rounded-full p-1 hover:bg-muted">
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
              className="rounded-md p-2 hover:bg-muted md:hidden"
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
              className="space-y-3 border-t border-border bg-sidebar px-4 py-3 md:hidden"
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
