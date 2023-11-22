import { TextField, Typography, Box, Button } from "@mui/material";
import { UseNodeStore } from "../stores/Node";
import { useForm, useFieldArray, FormProvider, SubmitHandler } from "react-hook-form";
import { UseJsonDataStore } from "../stores/JsonData";
import { NodeMetadataEditor } from "./NodeMetadataEditor";
import { StoryNode } from "../interfaces/Node";
import { ArrowRightAlt } from "@mui/icons-material";
import { useEffect } from "react";
interface StoryNodeForm extends Omit<StoryNode, "content"> {
  content: string;
}
const NodeEditor = () => {
  const { node, setNode } = UseNodeStore((state) => state);
  const jsonData = UseJsonDataStore((state) => state);
  const methods = useForm<StoryNodeForm>({
    defaultValues: {
      content: node?.content.join("\n"),
      choices: node?.choices,
      metadata: {
        ...node?.metadata,
      },
    },
  });

  const { fields } = useFieldArray({
    control: methods.control,
    name: "choices",
  });

  const submitNode: SubmitHandler<StoryNodeForm> = (data) => {
    if (node && data.choices && data.content && data.metadata) {
      const newNode = {
        // ...node,
        name: node.name,
        content: data.content.split("\n"),
        choices: data.choices,
        metadata: {
          ...data.metadata,
        },
      };
      setNode(newNode);
      jsonData.setNode(newNode, jsonData);
    } else {
      console.log("node is empty!");
    }
  };

  useEffect(() => {
    if (node) {
      methods.reset({
        content: node?.content.join("\n"),
        choices: node?.choices,
        metadata: {
          ...node?.metadata,
        },
      });
    }
  }, [node]);

  return (
    <FormProvider {...methods}>
      <Box
        sx={{ border: "1px solid #f6f6f6", borderRadius: 10, minWidth: "350px" }}
        component="form"
        onSubmit={methods.handleSubmit(submitNode)}
        display="flex"
        flexDirection="column"
        justifyContent="space-evenly"
        alignItems="center">
        <Typography variant="h3">{node?.name}</Typography>
        <TextField
          {...methods.register("content")}
          defaultValue={node?.content.join("\n")}
          multiline
          minRows={5}
          style={{ minWidth: "400px", maxWidth: "500px" }}
        />
        {fields.map((field, index) => (
          <Box
            key={field.id}
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            flexWrap="nowrap"
            paddingX="10px">
            <TextField
              sx={{ width: "350px" }}
              {...methods.register(`choices.${index}.text`)}
              defaultValue={field.text}
              multiline
            />
            <ArrowRightAlt sx={{ fontSize: "50px" }} />
            <Typography variant="h5">{field.destination}</Typography>
          </Box>
        ))}
        <NodeMetadataEditor />
        <Box display="flex" justifyContent="space-between" width={"250px"}>
          <Button variant="contained" color="warning" onClick={() => setNode(null)}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Update Node
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default NodeEditor;
