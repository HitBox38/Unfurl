import {
  TextField,
  Typography,
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
} from "@mui/material";
import { UseNodeStore } from "../stores/Node";
import { useForm, useFieldArray, FormProvider, SubmitHandler } from "react-hook-form";
import { UseJsonDataStore } from "../stores/JsonData";
import { NodeMetadataEditor } from "./NodeMetadataEditor";
import { StoryNode } from "../interfaces/Node";
import { ArrowRightAlt } from "@mui/icons-material";
import { useEffect } from "react";
import styled from "styled-components";
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
      <NodeEditorWrapper>
        <FormHeader title={node?.name} />
        <form onSubmit={methods.handleSubmit(submitNode)}>
          <NodeEditorForm>
            <TextArea
              {...methods.register("content")}
              defaultValue={node?.content.join("\n")}
              multiline
              minRows={5}
              maxRows={15}
            />
            {fields.map((field, index) => (
              <ChoiceWrapper key={field.id}>
                <ChoiceTextField
                  {...methods.register(`choices.${index}.text`)}
                  defaultValue={field.text}
                  multiline
                />
                <ArrowRightAlt sx={{ fontSize: "50px" }} />
                <Typography variant="h5">{field.destination}</Typography>
              </ChoiceWrapper>
            ))}
            <NodeMetadataEditor />
          </NodeEditorForm>

          <CardActions>
            <Button variant="contained" color="warning" onClick={() => setNode(null)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Update Node
            </Button>
          </CardActions>
        </form>
      </NodeEditorWrapper>
    </FormProvider>
  );
};

const TextArea = styled(TextField)`
  width: 100%;
`;

const ChoiceWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
`;

const ChoiceTextField = styled(TextField)`
  width: 350px;
`;

const NodeEditorForm = styled(CardContent)`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: start;
  gap: 30px;
`;

const FormHeader = styled(CardHeader)`
  text-align: start;
`;

const NodeEditorWrapper = styled(Card)`
  margin: auto 0;
  height: fit-content;
  padding: 10px;
`;

export default NodeEditor;
