import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { createChoice } from "@/shared/lib";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryNode } from "@/shared/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { buildChoiceEdgeId } from "@/features/dialog-viewer";
import { NodeMetadataEditor } from "@/features/node-editor/node-metadata-editor";

interface StoryNodeForm extends Omit<StoryNode, "content"> {
  content: string;
}

export const NodeEditor = () => {
  const node = useNodeStore((state) => state.node);
  const setNode = useNodeStore((state) => state.setNode);
  const setGraphPreview = useNodeStore((state) => state.setGraphPreview);
  const content = useJsonDataStore((state) => state.content);
  const setJsonNode = useJsonDataStore((state) => state.setNode);
  const nodeNames = useMemo(
    () => content.nodes.map((storyNode) => storyNode.name),
    [content.nodes],
  );

  const methods = useForm<StoryNodeForm>({
    defaultValues: {
      name: node?.name,
      content: node?.content.join("\n"),
      choices: node?.choices,
      metadata: { ...node?.metadata },
    },
  });

  const { append, fields, remove } = useFieldArray({
    control: methods.control,
    name: "choices",
  });

  const submitNode: SubmitHandler<StoryNodeForm> = (data) => {
    if (!node) return;
    const updated: StoryNode = {
      name: data.name.trim(),
      content: data.content.split("\n"),
      choices: data.choices,
      metadata: { ...data.metadata },
    };
    setNode(updated);
    setJsonNode(updated, node.name);
  };

  useEffect(() => {
    if (node) {
      methods.reset({
        name: node.name,
        content: node.content.join("\n"),
        choices: node.choices,
        metadata: { ...node.metadata },
      });
    }
  }, [node, methods]);

  useEffect(() => () => setGraphPreview(null), [setGraphPreview]);

  if (!node) {
    return null;
  }

  const getDestinationOptions = (destination: string) =>
    destination && !nodeNames.includes(destination)
      ? [destination, ...nodeNames]
      : nodeNames;

  const getDefaultChoiceDestination = () =>
    nodeNames.find((nodeName) => nodeName !== node.name) ?? "";

  const previewChoice = (
    destination: string | null | undefined,
    index: number,
  ) => {
    if (!destination) {
      setGraphPreview(null);
      return;
    }

    setGraphPreview({
      nodeName: destination,
      edgeId: buildChoiceEdgeId(node.name, destination, index),
    });
  };

  return (
    <FormProvider {...methods}>
      <Card className="flex max-h-[calc(100vh-8rem)] min-h-0 w-full flex-col rounded-xl border bg-card/95 p-0 shadow-2xl backdrop-blur-sm">
        <CardHeader className="gap-3 border-b px-4 py-3 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Edit node
              </CardDescription>
              <Label htmlFor="node-name" className="sr-only">
                Node name
              </Label>
              <Input
                id="node-name"
                aria-label="Node name"
                {...methods.register("name", {
                  required: "Node name is required",
                  setValueAs: (value) =>
                    typeof value === "string" ? value.trim() : value,
                  validate: (value) =>
                    value === node.name ||
                    !nodeNames.includes(value) ||
                    "Node name must be unique",
                })}
                className="h-auto rounded-md border border-transparent bg-transparent px-1 py-0 font-heading text-2xl font-medium leading-snug shadow-none ring-0 hover:border-input hover:bg-background/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-2xl dark:bg-transparent"
              />
              {methods.formState.errors.name ? (
                <p className="text-xs text-destructive">
                  {methods.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close node editor"
              className="shrink-0"
              onClick={() => {
                setGraphPreview(null);
                setNode(null);
              }}
            >
              <X />
            </Button>
          </div>
        </CardHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={methods.handleSubmit(submitNode)}
        >
          <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <Accordion
              type="multiple"
              defaultValue={["content", "choices", "metadata"]}
              className="flex flex-col gap-3"
            >
              <AccordionItem value="content">
                <AccordionTrigger>Content</AccordionTrigger>
                <AccordionContent>
                  <Label htmlFor="node-content" className="sr-only">
                    Content
                  </Label>
                  <Textarea
                    id="node-content"
                    {...methods.register("content")}
                    className="min-h-[140px] w-full resize-y bg-background/80"
                    defaultValue={node.content.join("\n")}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="choices">
                <AccordionTrigger>Choices</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {fields.map((field, index) => (
                    <section
                      key={field.id}
                      aria-label={`Choice ${index + 1} editor`}
                      className="space-y-3 rounded-xl border bg-background/80 p-3 shadow-sm"
                      onMouseEnter={() =>
                        previewChoice(
                          methods.getValues(`choices.${index}.destination`),
                          index,
                        )
                      }
                      onMouseLeave={() => setGraphPreview(null)}
                    >
                      <div className="flex items-center justify-between gap-2 border-b pb-2">
                        <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                          Choice {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          aria-label="Delete choice"
                          onClick={() => remove(index)}
                        >
                          <Trash />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`choice-${index}-text`}
                          className="text-xs text-muted-foreground"
                        >
                          Text
                        </Label>
                        <Textarea
                          id={`choice-${index}-text`}
                          aria-label={`Choice ${index + 1} text`}
                          {...methods.register(`choices.${index}.text`)}
                          className="min-h-[64px] min-w-0 resize-y"
                          defaultValue={field.text}
                        />
                      </div>
                      <div className="space-y-2">
                        <Controller
                          control={methods.control}
                          name={`choices.${index}.destination`}
                          render={({ field: destination }) => {
                            const optionText =
                              methods.watch(`choices.${index}.text`) ||
                              field.text;
                            return (
                              <>
                                <Label
                                  htmlFor={`choice-${index}-destination`}
                                  className="text-xs text-muted-foreground"
                                >
                                  Destination
                                </Label>
                                <div className="flex items-center">
                                  <Select
                                    value={destination.value}
                                    onValueChange={destination.onChange}
                                    onOpenChange={(open) => {
                                      if (!open) setGraphPreview(null);
                                    }}
                                  >
                                    <SelectTrigger
                                      id={`choice-${index}-destination`}
                                      aria-label={`Destination for option ${optionText}`}
                                      className="w-full bg-background"
                                    >
                                      <SelectValue placeholder="Select node" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getDestinationOptions(
                                        destination.value,
                                      ).map((nodeName) => (
                                        <SelectItem
                                          key={nodeName}
                                          value={nodeName}
                                          onFocus={() =>
                                            previewChoice(nodeName, index)
                                          }
                                          onMouseEnter={() =>
                                            previewChoice(nodeName, index)
                                          }
                                          onPointerMove={() =>
                                            previewChoice(nodeName, index)
                                          }
                                        >
                                          {nodeName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            );
                          }}
                        />
                      </div>
                    </section>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      append(createChoice(getDefaultChoiceDestination()))
                    }
                  >
                    Add choice
                  </Button>
                </AccordionContent>
              </AccordionItem>
              <NodeMetadataEditor />
            </Accordion>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
            {methods.formState.isDirty ? (
              <span className="text-sm text-warning">Unsaved changes</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                No unsaved changes
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="warning"
                onClick={() => {
                  setGraphPreview(null);
                  setNode(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!methods.formState.isDirty}>
                Update Node
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
};
