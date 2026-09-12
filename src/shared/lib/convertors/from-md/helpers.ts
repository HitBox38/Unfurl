import type { Choice } from "@/shared/types";

export const parseChoiceLink = (line: string): Choice => {
  const inside = line.substring(2, line.length - 2);
  const hasAlias = inside.includes("|");
  return {
    text: hasAlias ? inside.split("|")[1] : inside,
    destination: hasAlias ? inside.split("|")[0] : inside,
  };
};

export const stripExtension = (filename: string) => filename.split(".")[0];
