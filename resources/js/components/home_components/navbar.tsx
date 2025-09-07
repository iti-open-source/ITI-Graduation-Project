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

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const page = usePage();
  const { auth } = page.props as any;
  const getInitials = useInitials();

  const user = auth?.user;
  const isAuthenticated = !!user;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-sidebar-border/80 bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
              <img src="/apple-touch-icon.png" alt="" className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
              <span className="mb-0.5 truncate leading-tight font-semibold">MockMate</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <AppearanceToggleDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-10 rounded-full p-1">
                      <Avatar className="size-8 overflow-hidden rounded-full">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
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
          </div>
        </div>
      </nav>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
