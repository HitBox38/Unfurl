import type { StoryNode } from "@/shared/types";

import type { TweeDeclarationMetadata } from "./types";

export const parseCoordinatePair = (value: string | undefined) => {
  if (!value) return null;
  const [first, second] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  return { first, second };
};

export const parseDeclarationMetadata = (
  declaration: string,
): Pick<StoryNode, "position" | "size"> => {
  const metadataStart = declaration.indexOf("{");
  if (metadataStart === -1) return {};

  try {
    const metadata = JSON.parse(
      declaration.slice(metadataStart),
    ) as TweeDeclarationMetadata;
    const position = parseCoordinatePair(metadata.position);
    const size = parseCoordinatePair(metadata.size);
    return {
      ...(position
        ? { position: { x: position.first, y: position.second } }
        : {}),
      ...(size ? { size: { width: size.first, height: size.second } } : {}),
    };
  } catch {
    return {};
  }
};
