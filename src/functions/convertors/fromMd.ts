import { MetadataConfigTemplate } from "../../interfaces/MetadataConfigTemplate";
import { StoryNode } from "../../interfaces/Node";

export const fromMd = (files: File[], title: string) => {
  let config: MetadataConfigTemplate | null;
  const ls = localStorage.getItem("metadataConfig");
  if (ls !== null) {
    config = JSON.parse(ls);
  } else {
    config = null;
  }
  const nodes: StoryNode[] = [];

  files.forEach((file, index) => {
    file
      .text()
      .then((value) => {
        const metadata: {
          [name: string]: number | boolean;
        } = {};

        // Initialize metadata with default values based on config
        if (config !== null) {
          for (const configItem of config.config) {
            if (configItem.type === "number") {
              metadata[configItem.name] = 0;
            } else if (configItem.type === "boolean") {
              metadata[configItem.name] = false;
            }
          }
        }
        const lines: string[] = value.split("\n");
        const currentNode: StoryNode = {
          name: files[index].name.split(".")[0],
          metadata,
          choices: [],
          content: [],
        };

        try {
          lines.forEach((line) => {
            if (line.startsWith("[[") && line.endsWith("]]")) {
              const choice = line.substring(2, line.length - 3);
              const choiceObject = {
                text: choice.includes("|") ? choice.split("|")[1] : choice,
                destination: choice.includes("|") ? choice.split("|")[0] : choice,
              };
              currentNode.choices?.push(choiceObject);
            } else {
              let matchFound = false;
              if (config !== null) {
                for (const configItem of config.config) {
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
              }

              if (!matchFound && line !== "") {
                currentNode.content.push(line);
              }
            }
          });

          nodes.push(currentNode);
        } catch (error) {
          throw new Error("Failed to process the file content: " + error);
        }
      })
      .catch((error) => {
        console.error("An error occurred while reading the file:", error);
        throw error;
      });
  });

  return findFirstFileWithoutLinks(files)
    .then((file) => ({
      title,
      start: file ? file.name.split(".")[0] : null,
      nodes,
    }))
    .catch((error) => {
      console.error("An error occurred while processing the files:", error);
      throw error;
    });
};

const findFirstFileWithoutLinks = async (files: File[]) => {
  try {
    for (const file of files) {
      const content = await file.text();
      const linkedFiles = files.filter(
        (otherFile) => otherFile !== file && content.includes(`[[${otherFile.name}]]`)
      );

      if (linkedFiles.length === 0) {
        return file;
      }
    }
  } catch (error) {
    console.error("Error finding the first file without links:", error);
    throw new Error("Failed to find the first file without links.");
  }
};
