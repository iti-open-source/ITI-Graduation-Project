import { NavAppearance } from "@/components/nav-appearance";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// import { dashboard } from "@/routes";
import { SharedData, type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { LayoutGrid, PanelsRightBottom, Settings, Shield, User } from "lucide-react";
import AppLogo from "./app-logo";

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props;
  const mainNavItems: NavItem[] = [
    ...(auth.user?.role === "instructor"
      ? [
          {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutGrid,
          },
          {
            title: "Rooms",
            href: "/lobby",
            icon: PanelsRightBottom,
          },
        ]
      : []),
    ...(auth.user?.role === "admin"
      ? [
          {
            title: "Admin",
            href: "/admin",
            icon: Shield,
          },
          {
            title: "Lobby",
            href: "/lobby",
            icon: PanelsRightBottom,
          },
        ]
      : []),

    ...(auth.user?.role === "student"
      ? [
          {
            title: "Dashboard",
            href: "/dashboard",
            icon: User,
          },
          {
            title: "Rooms",
            href: "/lobby",
            icon: PanelsRightBottom,
          },
        ]
      : []),
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavAppearance />
        <NavFooter items={[]} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
