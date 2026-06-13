import type { MetadataConfigTemplate } from "@/shared/types";

export interface FromTweeOptions {
  config?: MetadataConfigTemplate | null;
}

export interface TweeDeclarationMetadata {
  position?: string;
  size?: string;
}
