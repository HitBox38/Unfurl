import { ArrowUpCircle, Info, RefreshCw } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

import { RELEASES_URL } from "./constants";
import type { useVersionCheck } from "./hooks/use-version-check";

export const VersionCheck = ({
  desktop,
  result,
  status,
  check,
}: ReturnType<typeof useVersionCheck>) => {
  const updateAvailable = result?.updateAvailable;
  const label = updateAvailable
    ? `Update available: v${result.version}`
    : `Unfurl v${__APP_VERSION__} — Check for updates`;

  return (
    <Dialog>
      <SidebarMenu>
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <DialogTrigger asChild>
            <SidebarMenuButton
              aria-label={label}
              tooltip={label}
              className="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
            >
              {updateAvailable ? (
                <ArrowUpCircle className="size-4 text-primary" />
              ) : (
                <Info className="size-4" />
              )}
              <span className="group-data-[collapsible=icon]:hidden">
                {updateAvailable ? "Update available" : `v${__APP_VERSION__}`}
              </span>
            </SidebarMenuButton>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unfurl updates</DialogTitle>
          <DialogDescription>You’re using v{__APP_VERSION__}.</DialogDescription>
        </DialogHeader>
        <div role="status" className="space-y-2 text-sm">
          {status === "checking" && <p>Checking for updates…</p>}
          {status === "error" && (
            <p>Couldn’t check for updates. Check your connection and try again later.</p>
          )}
          {status === "idle" && (
            <p>Check whether a newer version is available.</p>
          )}
          {status === "checked" && !result && (
            <p>No published release is available yet.</p>
          )}
          {status === "checked" && result && !updateAvailable && (
            <p>You’re up to date.</p>
          )}
          {updateAvailable && (
            <>
              <p className="font-medium">Unfurl v{result.version} is available.</p>
              <p className="text-muted-foreground">
                {desktop
                  ? "Open the release page to download the installer for Windows, macOS, or Linux."
                  : "Save any open edits before reloading to get the latest version."}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            disabled={status === "checking"}
            onClick={() => void check(true)}
          >
            <RefreshCw
              className={status === "checking" ? "size-4 motion-safe:animate-spin" : "size-4"}
            />
            Check for updates
          </Button>
          {desktop ? (
            <Button asChild variant={updateAvailable ? "default" : "outline"}>
              <a
                href={result?.releaseUrl ?? RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {updateAvailable ? "Download update" : "View releases"}
              </a>
            </Button>
          ) : updateAvailable ? (
            <Button onClick={() => window.location.reload()}>Reload to update</Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
