import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { logout } from "@/routes";
import { edit } from "@/routes/profile";
import { type User } from "@/types";
import { Link, router } from "@inertiajs/react";
import {
  LogOut,
  PanelsRightBottom,
  Settings,
  User as UserIcon,
  Users,
  UsersIcon,
} from "lucide-react";

interface UserMenuContentProps {
  user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();

  const handleLogout = () => {
    cleanup();
    router.flushAll();
  };
  const firstMenuItem =
    user.role === "student"
      ? {
          title: "My Rooms",
          href: "/lobby",
          icon: PanelsRightBottom,
        }
      : {
          title: "Lobby",
          href: "/lobby",
          icon: Users,
        };
  const secondMenuItem =
    user.role === "student"
      ? {
          title: "Profile",
          href: "/dashboard",
          icon: UserIcon,
        }
      : user.role === "admin"
        ? {
            title: "Dashboard",
            href: "/admin",
            icon: UserIcon,
          }
        : {
            title: "Dashboard",
            href: "/dashboard",
            icon: UsersIcon,
          };
  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {/* Conditional first menu item */}
        {user.role != null && user.role != "admin" && (
          <DropdownMenuItem asChild>
            <Link
              className="block w-full"
              href={firstMenuItem.href}
              as="button"
              prefetch
              onClick={cleanup}
            >
              <firstMenuItem.icon className="mr-2" />
              {firstMenuItem.title}
            </Link>
          </DropdownMenuItem>
        )}
        {/* {user.role != null && (
          <DropdownMenuItem asChild>
            <Link
              className="block w-full"
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              as="button"
              prefetch
              onClick={cleanup}
            >
              <UserIcon className="mr-2" />
              Dashboard
            </Link>
          </DropdownMenuItem>
        )} */}

        <DropdownMenuItem asChild>
          <Link
            className="block w-full"
            href={secondMenuItem.href}
            as="button"
            prefetch
            onClick={cleanup}
          >
            <secondMenuItem.icon className="mr-2" />
            {secondMenuItem.title}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link className="block w-full" href={edit()} as="button" prefetch onClick={cleanup}>
            <Settings className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link className="block w-full" href={logout()} as="button" onClick={handleLogout}>
          <LogOut className="mr-2" />
          Log out
        </Link>
      </DropdownMenuItem>
    </>
  );
}
