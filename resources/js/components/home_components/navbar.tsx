import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Settings, User, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import VerifyEmailButton from "../verify-email-button";

export default function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { auth } = usePage().props as any;

  const user = auth?.user;
  const isLoggedIn = !!user;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
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
    <>
      <nav className="sticky top-0 z-50 w-full bg-[var(--color-nav-bg)] text-[var(--color-nav-text)] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <img src="/logo.png" alt="Logo" className="h-10 w-60 object-contain" />
            {/* MockMate */}
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`relative flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${
                theme === "light" ? "bg-yellow-300" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  theme === "light" ? "translate-x-1" : "translate-x-7"
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

            {isLoggedIn && (
              <div className="relative" ref={menuRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="focus:outline-none"
                  style={{
                    borderColor: "var(--color-card-shadow)",
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith("http") ? user.avatar : `/storage/${user.avatar}`}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                      style={{
                        border: `1px solid var(--color-card-shadow)`,
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: "var(--color-section-alt-bg)",
                        color: "var(--color-text)",
                      }}
                    >
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
                      className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl shadow-lg"
                      style={{
                        backgroundColor: "var(--color-menu-bg)",
                        borderColor: "var(--color-menu-border)",
                        borderStyle: "solid",
                      }}
                    >
                      {/* User Info */}
                      <div
                        className="flex items-center space-x-3 border-b p-4"
                        style={{
                          borderColor: "var(--color-menu-border)",
                        }}
                      >
                        {user?.avatar ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `/storage/${user.avatar}`
                            }
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover"
                            style={{
                              border: `1px solid var(--color-card-shadow)`,
                            }}
                          />
                        ) : (
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-medium"
                            style={{
                              backgroundColor: "var(--color-section-alt-bg)",
                              color: "var(--color-text)",
                            }}
                          >
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p style={{ color: "var(--color-menu-text)", fontWeight: 500 }}>
                              {user?.name}
                            </p>

                            {user?.email_verified_at ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Verified
                              </span>
                            ) : (
                              <VerifyEmailButton />
                            )}
                          </div>

                          <p
                            style={{
                              color: "var(--color-menu-text-secondary)",
                              fontSize: "0.875rem",
                            }}
                          >
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                          style={{
                            color: "var(--color-menu-text)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--color-menu-hover-bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <User className="h-4 w-4" /> Profile
                        </Link>

                        <Link
                          href="/lobby"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                          style={{ color: "var(--color-menu-text)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--color-menu-hover-bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <Users className="h-4 w-4" /> Lobby
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                          style={{
                            color: "var(--color-menu-text)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--color-menu-hover-bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <Settings className="h-4 w-4" /> Account settings
                        </Link>

                        <Link
                          href="/logout"
                          method="post"
                          as="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                          style={{ color: "red" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--color-menu-hover-bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <LogOut className="h-4 w-4" /> Log out
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
