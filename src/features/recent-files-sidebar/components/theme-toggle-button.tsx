import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/shared/hooks/use-theme";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <SidebarMenu>
      <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarMenuButton
          type="button"
          aria-label={label}
          onClick={toggleTheme}
          tooltip={label}
          className="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span className="group-data-[collapsible=icon]:hidden">
            {isDark ? "Light mode" : "Dark mode"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
