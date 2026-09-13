import { useTheme, type Theme } from "@/shared/hooks/use-theme";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import {
  useSidebarPreference,
  type SidebarMode,
} from "../hooks/use-settings-preferences";
import { PreferenceError } from "./preference-error";

export const Appearance = () => {
  const { theme, setTheme, error } = useTheme();
  const [sidebar, setSidebar, sidebarError] = useSidebarPreference();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="settings-theme">Theme</Label>
        <Select
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          <SelectTrigger id="settings-theme" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          System follows your device’s light or dark appearance.
        </p>
        <PreferenceError show={error} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-sidebar">Sidebar on startup</Label>
        <Select
          value={sidebar}
          onValueChange={(value) => setSidebar(value as SidebarMode)}
        >
          <SelectTrigger id="settings-sidebar" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="expanded">Expanded</SelectItem>
            <SelectItem value="collapsed">Collapsed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Automatic expands the desktop app’s sidebar and adapts to the
          browser’s width. On phones, the sidebar always starts closed.
        </p>
        <p className="text-sm text-muted-foreground">
          You can still toggle the sidebar for the current session.
        </p>
        <PreferenceError show={sidebarError} />
      </div>
    </div>
  );
};
