import { ShieldCheck } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import {
  getAnalyticsConsent,
  isAnalyticsAvailable,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "@/shared/lib/analytics";
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

export const AnalyticsPreferences = () => {
  const consent = useSyncExternalStore(
    subscribeAnalyticsConsent,
    getAnalyticsConsent,
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const available = isAnalyticsAvailable();
  const region =
    import.meta.env.VITE_PUBLIC_POSTHOG_HOST === "https://us.i.posthog.com"
      ? "US"
      : "EU";
  const choose = (enabled: boolean) => {
    const saved = setAnalyticsConsent(enabled ? "granted" : "denied");
    setError(!saved);
    if (saved) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DialogTrigger asChild>
            <SidebarMenuButton
              tooltip="Privacy & analytics"
              aria-label="Privacy & analytics"
            >
              <ShieldCheck />
              <span className="group-data-[collapsible=icon]:hidden">
                Privacy & analytics
              </span>
            </SidebarMenuButton>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy & analytics</DialogTitle>
          <DialogDescription>
            Your stories stay on this device. Optional usage analytics help
            improve Unfurl.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            If enabled, Unfurl sends anonymous app opens, sample loads, imports,
            exports, first edits, and file reopen events to PostHog in the{" "}
            {region}. These include file formats, node-count ranges, app
            version, and distribution channel.
          </p>
          <p>
            Story text, titles, file names, and paths are never included.
            Session recording is disabled. No account is needed.
          </p>
          <p>
            You can turn analytics off here anytime. Turning it off removes this
            device’s analytics identifier; previously sent events are retained
            by PostHog.
          </p>
          <p role="status">
            Analytics are {available && consent === "granted" ? "on" : "off"}.
          </p>
          {!available ? <p>Analytics are unavailable in this build.</p> : null}
          {error ? (
            <p role="alert" className="text-destructive">
              Could not save your preference. Analytics are off for this
              session; try again before reopening the app.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => choose(false)}>
            {consent === "granted"
              ? "Turn analytics off"
              : "Keep analytics off"}
          </Button>
          <Button
            disabled={!available || consent === "granted"}
            onClick={() => choose(true)}
          >
            Enable anonymous analytics
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
