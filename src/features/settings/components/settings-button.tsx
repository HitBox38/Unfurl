import { ArrowUpCircle, Settings as SettingsIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";

import { useSettingsDialog } from "../hooks/use-settings-dialog";

export const SettingsButton = () => {
  const { open, updateAvailable } = useSettingsDialog();
  const { setOpenMobile } = useSidebar();
  const label = updateAvailable ? "Settings — update available" : "Settings";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          data-settings-trigger
          aria-label={label}
          tooltip={label}
          onClick={(event) => {
            setOpenMobile(false);
            open(event.currentTarget);
          }}
        >
          <span className="relative shrink-0">
            <SettingsIcon className="size-4" />
            {updateAvailable && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary ring-2 ring-sidebar" />
            )}
          </span>
          <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          {updateAvailable && (
            <ArrowUpCircle
              aria-hidden="true"
              className="ml-auto text-primary group-data-[collapsible=icon]:hidden"
            />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
