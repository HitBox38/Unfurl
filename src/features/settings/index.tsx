import { useRef, useState, type ReactNode } from "react";
import {
  Info,
  Palette,
  RefreshCw,
  ShieldCheck,
  SpellCheck,
} from "lucide-react";

import { AnalyticsPreferences } from "@/features/analytics-preferences";
import { VersionCheck } from "@/features/version-check";
import { useVersionCheck } from "@/features/version-check/hooks/use-version-check";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { SettingsContext } from "./hooks/use-settings-dialog";
import { useAutomaticUpdates } from "./hooks/use-settings-preferences";
import { Appearance } from "./components/appearance";
import { About } from "./components/about";
import { Writing } from "./components/writing";
import { PreferenceError } from "./components/preference-error";

export { SettingsButton } from "./components/settings-button";

const sections = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "updates", label: "Updates", icon: RefreshCw },
  { id: "writing", label: "Writing", icon: SpellCheck },
  { id: "about", label: "About", icon: Info },
] as const;

export const Settings = ({
  children,
  desktop = Boolean(window.ipcRenderer),
}: {
  children: ReactNode;
  desktop?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string>("appearance");
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [automatic, setAutomatic, error] = useAutomaticUpdates();
  const versionCheck = useVersionCheck(desktop, automatic);
  return (
    <SettingsContext.Provider
      value={{
        open: (element) => {
          trigger.current = element;
          setOpen(true);
        },
        updateAvailable: Boolean(versionCheck.result?.updateAvailable),
      }}
    >
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-2xl"
          onKeyDown={(event) => event.stopPropagation()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = trigger.current?.isConnected
              ? trigger.current
              : document.querySelector<HTMLButtonElement>(
                  '[aria-label="Toggle sidebar"]',
                );
            target?.focus();
          }}
        >
          <DialogHeader className="shrink-0 border-b px-6 py-5 pr-12">
            <DialogTitle className="text-xl">Settings</DialogTitle>
            <DialogDescription>
              Make Unfurl feel like home. Changes apply immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-col sm:flex-row">
            <nav
              aria-label="Settings sections"
              className="grid shrink-0 grid-cols-2 gap-1 border-b p-3 sm:flex sm:w-40 sm:flex-col sm:border-r sm:border-b-0"
            >
              {sections
                .filter((item) => desktop || item.id !== "writing")
                .map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={section === id ? "secondary" : "ghost"}
                    className="shrink-0 justify-start"
                    aria-pressed={section === id}
                    onClick={() => setSection(id)}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Button>
                ))}
            </nav>
            <section
              aria-label={sections.find((item) => item.id === section)?.label}
              className="min-h-0 min-w-0 flex-1 overflow-y-auto p-6 sm:min-h-80"
            >
              <h2 className="mb-5 font-heading text-lg font-medium">
                {sections.find((item) => item.id === section)?.label}
              </h2>
              {section === "appearance" && <Appearance />}
              {section === "privacy" && <AnalyticsPreferences />}
              {section === "updates" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="automatic-updates"
                        checked={automatic}
                        onCheckedChange={(checked) =>
                          setAutomatic(checked === true)
                        }
                      />
                      <Label htmlFor="automatic-updates">
                        Automatically check for updates
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check at startup and hourly while Unfurl is visible. You
                      can always check manually.
                    </p>
                    <PreferenceError show={error} />
                  </div>
                  <VersionCheck {...versionCheck} />
                </div>
              )}
              {section === "writing" && desktop && <Writing />}
              {section === "about" && <About />}
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsContext.Provider>
  );
};
