import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const documentHtml = readFileSync(path.join(projectRoot, "index.html"), "utf8");
const documentHead = new DOMParser().parseFromString(documentHtml, "text/html").head;

const expectedTitle = "Unfurl - branching dialogue editor";
const expectedDescription =
  "Write branching dialogue for your game. Import Twee, Obsidian Markdown, or Unfurl JSON, edit a visual story graph, and export JSON. No account needed.";
const expectedSiteUrl = "https://unfurl.ink";
const expectedImageUrl = "https://unfurl.ink/unfurl-og.png";

function metaContent(selector: string): string | null {
  return documentHead.querySelector(selector)?.getAttribute("content") ?? null;
}

describe("document metadata", () => {
  it("uses the production title across page, Open Graph, and Twitter metadata", () => {
    expect(documentHead.querySelector("title")?.textContent).toBe(expectedTitle);
    expect(metaContent('meta[property="og:title"]')).toBe(expectedTitle);
    expect(metaContent('meta[name="twitter:title"]')).toBe(expectedTitle);
  });

  it("uses aligned description metadata with the correct name attribute", () => {
    expect(metaContent('meta[name="description"]')).toBe(expectedDescription);
    expect(metaContent('meta[property="description"]')).toBeNull();
    expect(metaContent('meta[property="og:description"]')).toBe(expectedDescription);
    expect(metaContent('meta[name="twitter:description"]')).toBe(expectedDescription);
    expect(documentHtml).not.toMatch(/convertor/i);
  });

  it("points social and canonical URLs at unfurl.ink", () => {
    expect(
      documentHead.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe(expectedSiteUrl);
    expect(metaContent('meta[property="og:url"]')).toBe(expectedSiteUrl);
    expect(metaContent('meta[property="og:image"]')).toBe(expectedImageUrl);
    expect(metaContent('meta[name="twitter:image"]')).toBe(expectedImageUrl);
    expect(metaContent('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  it("publishes a social-compatible PNG with accurate dimensions and MIME type", () => {
    const imageUrl = metaContent('meta[property="og:image"]');
    expect(imageUrl).toBe(expectedImageUrl);
    const imagePath = new URL(imageUrl!).pathname.replace(/^\//, "");
    const image = readFileSync(path.join(projectRoot, "public", imagePath));

    expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(image.subarray(12, 16).toString("ascii")).toBe("IHDR");
    expect(metaContent('meta[property="og:image:type"]')).toBe("image/png");
    expect(Number(metaContent('meta[property="og:image:width"]'))).toBe(
      image.readUInt32BE(16),
    );
    expect(Number(metaContent('meta[property="og:image:height"]'))).toBe(
      image.readUInt32BE(20),
    );
    expect(image.length).toBeLessThan(5_000_000);
  });

  it("provides matching image descriptions for both social cards", () => {
    const alt = metaContent('meta[property="og:image:alt"]');
    expect(alt).toBeTruthy();
    expect(metaContent('meta[name="twitter:image:alt"]')).toBe(alt);
  });
});
