import { Request, Response } from "express";
import { StoryNode } from "../interfaces/Node";
import { Choice } from "../interfaces/Choice";
import { StoryData } from "../interfaces/StoryData";

export const uploadFile = (req: Request, res: Response) => {
  try {
    const fileBuffer = req.file?.buffer?.toString();
    if (fileBuffer) {
      const lines: string[] = fileBuffer.split("\n");

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
          const [declareName, rest] = declaration.split("[");
          const tags: string[] = rest ? rest.slice(0, -1).split(" ") : [];

          const name: string = declareName.split("{")[0].trim();

          let affectionToAdd: number = 0;
          let affectionRequired: number = 0;
          let giveBlessing: boolean = false;
          let giveHead: boolean = false;

          currentNode = {
            name,
            affectionToAdd,
            affectionRequired,
            giveBlessing,
            giveHead,
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
          } else if (line.match(/#@/)) {
            const varValue: number = Number(line.split("#@")[1].slice(0, 2).trim());
            currentNode.affectionToAdd = varValue;
          } else if (line.match(/#\?/)) {
            const varValue: number = Number(line.split("#?")[1].slice(0, 1).trim());
            currentNode.affectionRequired = varValue;
          } else if (line.match(/#%#%/)) {
            currentNode.giveBlessing = true;
          } else if (line.match(/#\*#\*/)) {
            currentNode.giveHead = true;
          } else {
            currentNode.content.push(line);
          }
        }
      }

      if (currentNode) {
        nodes.push(currentNode);
      }

      const data: StoryData = { title, start, nodes };

      res.send({ file: data });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
