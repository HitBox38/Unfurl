import { LATEST_RELEASE_API, RELEASES_URL } from "./constants";
import { isNewerVersion } from "./helpers";

export type VersionResult = {
  version: string;
  updateAvailable: boolean;
  releaseUrl?: string;
};

export async function fetchLatestVersion(
  desktop: boolean,
  signal: AbortSignal,
): Promise<VersionResult | null> {
  const url = desktop
    ? LATEST_RELEASE_API
    : `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;
  const response = await fetch(url, {
    signal,
    cache: "no-store",
    credentials: "omit",
  });
  if (desktop && response.status === 404) return null;
  if (!response.ok) throw new Error(`Version check failed (${response.status})`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") throw new Error("Invalid version response");
  let version: unknown;
  if (desktop) {
    if (
      !("draft" in data) || data.draft !== false ||
      !("prerelease" in data) || data.prerelease !== false
    ) {
      throw new Error("Invalid release response");
    }
    version = "tag_name" in data ? data.tag_name : undefined;
  } else {
    version = "version" in data ? data.version : undefined;
  }
  if (typeof version !== "string") throw new Error("Missing version");
  const updateAvailable = isNewerVersion(version, __APP_VERSION__);
  return {
    version: version.replace(/^v/, ""),
    updateAvailable,
    // Construct the link on our release host instead of trusting a remote URL.
    releaseUrl: desktop
      ? `${RELEASES_URL}/tag/${encodeURIComponent(version)}`
      : undefined,
  };
}
