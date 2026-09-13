import { RefreshCw } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { RELEASES_URL } from "./constants";
import type { useVersionCheck } from "./hooks/use-version-check";

export const VersionCheck = ({
  desktop,
  result,
  status,
  check,
}: ReturnType<typeof useVersionCheck>) => {
  const updateAvailable = result?.updateAvailable;
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">You’re using v{__APP_VERSION__}.</p>
      <div role="status" className="space-y-2 text-sm">
        {status === "checking" && <p>Checking for updates…</p>}
        {status === "error" && (
          <p>
            Couldn’t check for updates. Check your connection and try again
            later.
          </p>
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
            <p className="font-medium">
              Unfurl v{result.version} is available.
            </p>
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
            className={
              status === "checking"
                ? "size-4 motion-safe:animate-spin"
                : "size-4"
            }
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
          <Button onClick={() => window.location.reload()}>
            Reload to update
          </Button>
        ) : null}
      </div>
    </div>
  );
};
