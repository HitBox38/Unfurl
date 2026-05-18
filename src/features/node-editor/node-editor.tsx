import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import {
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
import { Textarea } from "@/shared/ui/textarea";

import { NodeMetadataEditor } from "@/features/node-editor/node-metadata-editor";

interface StoryNodeForm extends Omit<StoryNode, "content"> {
  content: string;
}

export const NodeEditor = () => {
  const node = useNodeStore((state) => state.node);
  const setNode = useNodeStore((state) => state.setNode);
  const setJsonNode = useJsonDataStore((state) => state.setNode);

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

  if (!node) {
    return null;
  }

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
                <span className="text-xl font-semibold">
                  {field.destination}
                </span>
              </div>
            ))}
            <NodeMetadataEditor />
          </CardContent>
          <CardFooter className="flex items-center gap-2 px-6 pt-2">
            <Button
              type="button"
              variant="warning"
              onClick={() => setNode(null)}
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
