import {
  loadMetadataConfigFromStorage,
  seedMetadataDefaults,
} from "@/shared/lib/convertors/load-metadata-config";
import type {
  Choice,
  MetadataConfigTemplate,
  StoryData,
  StoryNode,
} from "@/shared/types";

export interface FromMdOptions {
  config?: MetadataConfigTemplate | null;
}

export interface MarkdownEntry {
  name: string;
  source: string;
}

const parseChoiceLink = (line: string): Choice => {
  const inside = line.substring(2, line.length - 2);
  const hasAlias = inside.includes("|");
  return {
    text: hasAlias ? inside.split("|")[1] : inside,
    destination: hasAlias ? inside.split("|")[0] : inside,
  };
};

export const parseMarkdownEntries = (
  entries: MarkdownEntry[],
  title: string,
  options: FromMdOptions = {},
): StoryData => {
  const config =
    options.config !== undefined
      ? options.config
      : loadMetadataConfigFromStorage();

  const nodes: StoryNode[] = entries.map((entry) => {
    const lines = entry.source.split("\n");
    const node: StoryNode = {
      name: entry.name,
      metadata: seedMetadataDefaults(config),
      choices: [],
      content: [],
    };

    for (const line of lines) {
      if (line.startsWith("[[") && line.endsWith("]]")) {
        node.choices.push(parseChoiceLink(line));
        continue;
      }

      let matchFound = false;
      if (config) {
        for (const configItem of config.config) {
          if (line.startsWith(configItem.sign)) {
            const value = line.split(configItem.sign)[1].trim();
            if (configItem.type === "number") {
              node.metadata[configItem.name] = Number(value);
            } else if (configItem.type === "boolean") {
              node.metadata[configItem.name] = true;
            }
            matchFound = true;
            break;
          }
        }
      }

      if (!matchFound && line !== "") {
        node.content.push(line);
      }
    }

    return node;
  });

  const start =
    entries.find((candidate) => {
      const outgoing = entries.filter(
        (other) =>
          other.name !== candidate.name &&
          candidate.source.includes(`[[${other.name}]]`),
      );
      return outgoing.length === 0;
    })?.name ?? null;

  return { title, start, nodes };
};

const stripExtension = (filename: string) => filename.split(".")[0];

export const fromMd = async (
  files: File[],
  title: string,
  options: FromMdOptions = {},
): Promise<StoryData> => {
  const entries = await Promise.all(
    files.map(async (file) => ({
      name: stripExtension(file.name),
      source: await file.text(),
    })),
  );
  try {
    return parseMarkdownEntries(entries, title, options);
  } catch (error) {
    throw new Error(`Failed to process the file content: ${error}`, {
      cause: error,
    });
  }
};
