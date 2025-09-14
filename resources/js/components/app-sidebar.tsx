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
import { LayoutGrid, Settings, Shield, User } from "lucide-react";
import AppLogo from "./app-logo";



export function AppSidebar() {
  const { auth } = usePage<SharedData>().props;
  const mainNavItems: NavItem[] = [
  // {
  //   title: "Dashboard",
  //   href: dashboard(),
  //   icon: LayoutGrid,
  // },
//   {
//     title: "Admin",
//     href: "/admin",
//     icon: Shield,
//   },
// ];

 ...(auth.user?.role === "admin" || auth.user?.role === "instructor"
      ? [
          {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutGrid,
          },
          {
            title: "Settings",
            href: "/settings",
            icon: Settings,
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
            title: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ]
      : []),

       ...(auth.user?.role === "student"
      ? [
          {
            title: "Profile",
            href: "/dashboard",
            icon: User,
          },
          {
            title: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ]
      : []),






     
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
        <NavFooter items={[]} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
