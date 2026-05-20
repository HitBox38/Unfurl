import { ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryNode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { NodeMetadataEditor } from "@/features/node-editor/node-metadata-editor";

interface StoryNodeForm extends Omit<StoryNode, "content"> {
  content: string;
}

export const NodeEditor = () => {
  const node = useNodeStore((state) => state.node);
  const setNode = useNodeStore((state) => state.setNode);
  const setPreviewNodeName = useNodeStore((state) => state.setPreviewNodeName);
  const content = useJsonDataStore((state) => state.content);
  const setJsonNode = useJsonDataStore((state) => state.setNode);
  const nodeNames = useMemo(
    () => content.nodes.map((storyNode) => storyNode.name),
    [content.nodes],
  );

  const methods = useForm<StoryNodeForm>({
    defaultValues: {
      content: node?.content.join("\n"),
      choices: node?.choices,
      metadata: { ...node?.metadata },
    },
  });

  const { fields } = useFieldArray({
    control: methods.control,
    name: "choices",
  });

  const submitNode: SubmitHandler<StoryNodeForm> = (data) => {
    if (!node) return;
    const updated: StoryNode = {
      name: node.name,
      content: data.content.split("\n"),
      choices: data.choices,
      metadata: { ...data.metadata },
    };
    setNode(updated);
    setJsonNode(updated);
  };

  useEffect(() => {
    if (node) {
      methods.reset({
        content: node.content.join("\n"),
        choices: node.choices,
        metadata: { ...node.metadata },
      });
    }
  }, [node, methods]);

  useEffect(() => () => setPreviewNodeName(null), [setPreviewNodeName]);

  if (!node) {
    return null;
  }

  const getDestinationOptions = (destination: string) =>
    destination && !nodeNames.includes(destination)
      ? [destination, ...nodeNames]
      : nodeNames;

  return (
    <FormProvider {...methods}>
      <Card className="m-auto h-fit w-full max-w-[650px] p-2.5">
        <CardHeader className="text-left">
          <CardTitle className="text-2xl">{node.name}</CardTitle>
        </CardHeader>
        <form onSubmit={methods.handleSubmit(submitNode)}>
          <CardContent className="flex flex-col items-start gap-7">
            <Textarea
              {...methods.register("content")}
              className="min-h-[140px] w-full"
              defaultValue={node.content.join("\n")}
            />
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-nowrap items-center justify-center gap-3"
              >
                <Textarea
                  {...methods.register(`choices.${index}.text`)}
                  className="min-h-[60px] w-[350px]"
                  defaultValue={field.text}
                />
                <ArrowRight className="size-12 text-muted-foreground" />
                <Controller
                  control={methods.control}
                  name={`choices.${index}.destination`}
                  render={({ field: destination }) => {
                    const optionText =
                      methods.watch(`choices.${index}.text`) || field.text;
                    return (
                      <Select
                        value={destination.value}
                        onValueChange={destination.onChange}
                        onOpenChange={(open) => {
                          if (!open) setPreviewNodeName(null);
                        }}
                      >
                        <SelectTrigger
                          aria-label={`Destination for option ${optionText}`}
                          className="w-[180px]"
                        >
                          <SelectValue placeholder="Select node" />
                        </SelectTrigger>
                        <SelectContent>
                          {getDestinationOptions(destination.value).map(
                            (nodeName) => (
                              <SelectItem
                                key={nodeName}
                                value={nodeName}
                                onFocus={() => setPreviewNodeName(nodeName)}
                                onMouseEnter={() =>
                                  setPreviewNodeName(nodeName)
                                }
                                onPointerMove={() =>
                                  setPreviewNodeName(nodeName)
                                }
                              >
                                {nodeName}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </div>
            ))}
            <NodeMetadataEditor />
          </CardContent>
          <CardFooter className="flex items-center gap-2 px-6 pt-2">
            <Button
              type="button"
              variant="warning"
              onClick={() => {
                setPreviewNodeName(null);
                setNode(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!methods.formState.isDirty}>
              Update Node
            </Button>
            {methods.formState.isDirty ? (
              <span className="px-1 text-sm text-warning">
                *Unsaved changes
              </span>
            ) : null}
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
};
