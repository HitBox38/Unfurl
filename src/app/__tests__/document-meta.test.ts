import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const documentHtml = readFileSync(path.join(projectRoot, "index.html"), "utf8");
const documentHead = new JSDOM(documentHtml).window.document.head;

const expectedTitle = "Unfurl - branching dialogue editor";
const expectedDescription =
  "Unfurl is a local-first branching dialogue editor: import Twee, Obsidian Markdown, or Unfurl JSON, graph edit, then export engine-agnostic JSON. No account.";
const expectedSiteUrl = "https://unfurl.ink";
const expectedImageUrl = "https://unfurl.ink/unfurl-og.svg";

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
    expect(documentHead.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(expectedSiteUrl);
    expect(metaContent('meta[property="og:url"]')).toBe(expectedSiteUrl);
    expect(metaContent('meta[property="og:image"]')).toBe(expectedImageUrl);
    expect(metaContent('meta[name="twitter:image"]')).toBe(expectedImageUrl);
    expect(metaContent('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  it("publishes the referenced social image asset", () => {
    const imagePath = new URL(expectedImageUrl).pathname.replace(/^\//, "");

    expect(existsSync(path.join(projectRoot, "public", imagePath))).toBe(true);
  });
});
