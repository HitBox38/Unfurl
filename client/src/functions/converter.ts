import { Choice } from "../interfaces/Choice";
import { StoryNode } from "../interfaces/Node";
import { StoryData } from "../interfaces/StoryData";

export const converter = (file: File) => {
  const config = JSON.parse(window.localStorage.getItem("metadataConfig") || "").config;
  console.log(config);

  return file?.text().then((value) => {
    if (value) {
      const lines: string[] = value.split("\n");
      const nodes: StoryNode[] = [];
      let currentNode: StoryNode | null = null;
      let start: string | null = null;
      let title: string | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line: string = lines[i];

        if (line.startsWith(":: StoryTitle")) {
          title = lines[i + 1].trim();
          continue;
        } else if (line.startsWith(":: StoryData")) {
          const startLine: string = lines[i + 5].trim();
          const startMatch: RegExpMatchArray | null = startLine.match(/"start"\s*:\s*"([^"]+)"/);
          if (startMatch) {
            start = startMatch[1];
          }
          continue;
        }

        if (line.startsWith("::")) {
          if (currentNode) {
            nodes.push(currentNode);
          }

          const declaration: string = line.slice(2).trim();
          const declareName = declaration.split("[")[0];
          const name: string = declareName.split("{")[0].trim();
          const metadata: any = {};

          // Initialize metadata with default values based on config
          for (const configItem of config) {
            if (configItem.type === "number") {
              metadata[configItem.name] = 0;
            } else if (configItem.type === "boolean") {
              metadata[configItem.name] = false;
            }
          }

          currentNode = {
            name,
            metadata,
            choices: [],
            content: [],
          };
        } else if (currentNode) {
          const choices: RegExpMatchArray | null = line.match(/\[\[(.*?)\]\]/g);
          if (choices) {
            for (const choice of choices) {
              const choiceText: string[] = choice.slice(2, -2).split("->");
              const choiceObject: Choice = {
                text: choiceText[0].trim(),
                destination: choiceText[1].trim(),
              };
              currentNode.choices.push(choiceObject);
            }
          } else {
            // Check if line matches any sign in config
            let matchFound = false;
            for (const configItem of config) {
              if (line.startsWith(configItem.sign)) {
                const value = line.split(configItem.sign)[1].trim();

                // Convert value based on type in config
                if (configItem.type === "number") {
                  currentNode.metadata[configItem.name] = Number(value);
                } else if (configItem.type === "boolean") {
                  currentNode.metadata[configItem.name] = true;
                }
                matchFound = true;
                break;
              }
            }
            // If the line does not match any sign, it belongs to content
            if (!matchFound && line !== "") {
              currentNode.content.push(line);
            }
          }
        }
      }

      if (currentNode) {
        nodes.push(currentNode);
      }

      const data: StoryData = { title, start, nodes };
      console.log(data);

      return data;
    } else {
      console.log("Error", value);
    }
  });
};
