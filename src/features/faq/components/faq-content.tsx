import type { ReactNode } from "react";

import { FileTypeBadge } from "@/shared/components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

const Kbd = ({ children }: { children: string }) => (
  <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-xs">
    {children}
  </kbd>
);

const FormatLine = ({
  fileType,
  label,
}: {
  fileType: "twee" | "md" | "json";
  label: string;
}) => (
  <li className="flex items-center gap-2">
    <FileTypeBadge fileType={fileType} />
    <span>{label}</span>
  </li>
);

const FAQ_ITEMS: { id: string; question: string; answer: ReactNode }[] = [
  {
    id: "what-is",
    question: "What is Unfurl?",
    answer: (
      <div className="flex flex-col gap-3">
        <p>
          Unfurl takes dialogs written in Twine or other markdown formats and
          lets you visualize, edit, and convert them to JSON for your game.
        </p>
        <p>
          Load the demo file with the Konami code <Kbd>↑</Kbd> <Kbd>↑</Kbd>{" "}
          <Kbd>↓</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>←</Kbd>{" "}
          <Kbd>→</Kbd> <Kbd>B</Kbd> <Kbd>A</Kbd>. Open this FAQ anytime with{" "}
          <Kbd>Ctrl+C</Kbd> then <Kbd>Ctrl+F</Kbd>.
        </p>
      </div>
    ),
  },
  {
    id: "in-game",
    question: "How do I use these files in my game?",
    answer: (
      <p>
        Export as JSON and import it however your engine expects. In Unity, for
        example, you build your own dialog manager and load the JSON as a text
        asset.
      </p>
    ),
  },
  {
    id: "formats",
    question: "What are the supported formats?",
    answer: (
      <ul className="flex flex-col gap-2">
        <FormatLine fileType="twee" label="Twine" />
        <FormatLine fileType="md" label="Obsidian notes" />
        <FormatLine fileType="json" label="Unfurl JSON" />
      </ul>
    ),
  },
  {
    id: "contribute",
    question: "Source and contributing",
    answer: (
      <p>
        Unfurl is open-source and free to use. The source is on{" "}
        <a
          className="cursor-pointer text-info underline-offset-4 hover:underline"
          href="https://github.com/HitBox38/Unfurl"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        . Bugs and feature requests go in{" "}
        <a
          className="cursor-pointer text-info underline-offset-4 hover:underline"
          href="https://github.com/HitBox38/Unfurl/issues"
          target="_blank"
          rel="noreferrer"
        >
          GitHub issues
        </a>
        .
      </p>
    ),
  },
];

export const FaqContent = () => (
  <Accordion
    type="single"
    collapsible
    defaultValue="what-is"
    className="text-left"
  >
    {FAQ_ITEMS.map((item) => (
      <AccordionItem key={item.id} value={item.id}>
        <AccordionTrigger>{item.question}</AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          {item.answer}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
