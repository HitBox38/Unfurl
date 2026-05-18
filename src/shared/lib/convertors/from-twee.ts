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

export interface FromTweeOptions {
  config?: MetadataConfigTemplate | null;
}

export const parseTwee = (
  source: string,
  options: FromTweeOptions = {},
): StoryData => {
  const config =
    options.config !== undefined
      ? options.config
      : loadMetadataConfigFromStorage();

  const lines = source.split("\n");
  const nodes: StoryNode[] = [];
  let currentNode: StoryNode | null = null;
  let start: string | null = null;
  let title: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith(":: StoryTitle")) {
      title = lines[i + 1]?.trim() ?? null;
      continue;
    }

    if (line.startsWith(":: StoryData")) {
      const startLine = lines[i + 5]?.trim() ?? "";
      const startMatch = startLine.match(/"start"\s*:\s*"([^"]+)"/);
      if (startMatch) {
        start = startMatch[1];
      }
      continue;
    }

    if (line.startsWith("::")) {
      if (currentNode) {
        nodes.push(currentNode);
      }
      const declaration = line.slice(2).trim();
      const declareName = declaration.split("[")[0];
      const name = declareName.split("{")[0].trim();
      currentNode = {
        name,
        metadata: seedMetadataDefaults(config),
        choices: [],
        content: [],
      };
      continue;
    }

    if (!currentNode) {
      continue;
    }

    const choiceMatches = line.match(/\[\[(.*?)\]\]/g);
    if (choiceMatches) {
      for (const choice of choiceMatches) {
        const parts = choice.slice(2, -2).split("->");
        const choiceObject: Choice = {
          text: parts[0].trim(),
          destination: (parts[1] ?? parts[0]).trim(),
        };
        currentNode.choices.push(choiceObject);
      }
      continue;
    }

    let matchFound = false;
    if (config) {
      for (const configItem of config.config) {
        if (line.startsWith(configItem.sign)) {
          const value = line.split(configItem.sign)[1].trim();
          if (configItem.type === "number") {
            currentNode.metadata[configItem.name] = Number(value);
          } else if (configItem.type === "boolean") {
            currentNode.metadata[configItem.name] = true;
          }
          matchFound = true;
          break;
        }
      }
    }

    if (!matchFound && line !== "") {
      currentNode.content.push(line);
    }
  }

  if (currentNode) {
    nodes.push(currentNode);
  }

  return { title, start, nodes };
};

export const fromTwee = async (
  file: File,
  options: FromTweeOptions = {},
): Promise<StoryData> => {
  const source = await file.text();
  if (!source) {
    throw new Error(`File is empty or unreadable: ${file.name}`);
  }
  try {
    return parseTwee(source, options);
  } catch (error) {
    throw new Error(`Failed to process the file content: ${error}`, {
      cause: error,
    });
  }
};
