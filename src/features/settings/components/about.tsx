import { ExternalLink } from "lucide-react";

import { RELEASES_URL } from "@/features/version-check/constants";
import { Button } from "@/shared/ui/button";

const links = [
  ["GitHub", "https://github.com/HitBox38/Unfurl"],
  ["Releases", RELEASES_URL],
  ["itch.io", "https://hit-box38.itch.io/unfurl"],
  ["Online app", "https://unfurl-online.vercel.app"],
] as const;

export const About = () => {
  const channel = import.meta.env.VITE_PUBLIC_DISTRIBUTION;
  const label =
    channel === "web"
      ? "Web"
      : channel === "desktop_github"
        ? "Desktop · GitHub"
        : channel === "desktop_itch"
          ? "Desktop · itch.io"
          : "Development / unspecified distribution";
  return (
    <div className="space-y-6">
      <div>
        <p className="font-heading text-2xl font-medium">Unfurl</p>
        <p className="mt-1 text-muted-foreground">
          A home for your branching stories.
        </p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
        <dt className="text-muted-foreground">Version</dt>
        <dd>{__APP_VERSION__}</dd>
        <dt className="text-muted-foreground">Distribution</dt>
        <dd>{label}</dd>
      </dl>
      <div className="flex flex-wrap gap-2">
        {links.map(([name, url]) => (
          <Button key={name} asChild variant="outline" size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {name}
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
};
