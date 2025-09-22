import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppearance } from "@/hooks/use-appearance";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronsUpDown, Monitor, Moon, Sun } from "lucide-react";

export function NavAppearance() {
  const { appearance, updateAppearance } = useAppearance();
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  const getCurrentIcon = () => {
    switch (appearance) {
      case "dark":
        return <Moon className="size-4" />;
      case "light":
        return <Sun className="size-4" />;
      default:
        return <Monitor className="size-4" />;
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center data-[state=open]:bg-sidebar-accent"
            >
              {getCurrentIcon()}
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                Appearance
              </span>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="end"
            side={isMobile ? "bottom" : state === "collapsed" ? "right" : "bottom"}
          >
            <DropdownMenuItem onClick={() => updateAppearance("light")}>
              <div className="flex items-center gap-2">
                <Sun className="size-4" />
                <span>Light</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateAppearance("dark")}>
              <div className="flex items-center gap-2">
                <Moon className="size-4" />
                <span>Dark</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateAppearance("system")}>
              <div className="flex items-center gap-2">
                <Monitor className="size-4" />
                <span>System</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
