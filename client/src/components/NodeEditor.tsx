import { TextField, Typography, Box, Button } from "@mui/material";
import { UseNodeStore } from "../Store/Node";
import { useForm, useFieldArray, FormProvider, SubmitHandler } from "react-hook-form";
import { UseJsonDataStore } from "../Store/JsonData";
import { NodeMetadataEditor } from "./NodeMetadataEditor";
import { StoryNode } from "../interfaces/Node";
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
        affectionRequired: node?.metadata.affectionRequired,
        affectionToAdd: node?.metadata.affectionToAdd,
        giveBlessing: node?.metadata.giveBlessing,
        giveHead: node?.metadata.giveHead,
      },
    },
  });

  const { fields } = useFieldArray({
    control: methods.control,
    name: "choices",
  });

  const submitNode: SubmitHandler<StoryNodeForm> = (data) => {
    if (node && data.choices && data.content) {
      setNode({ ...node, content: data.content.split("\n"), choices: data.choices });
      jsonData.setNode(node, jsonData);
    } else {
      console.log("node is empty!");
    }
  };

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
          onChange={(e) => {
            if (node) {
              setNode({ ...node, content: e.target.value.split("\n") });
            }
          }}
          multiline
          minRows={5}
          style={{ minWidth: "350px" }}
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
            <Typography variant="h4"> ➡ </Typography>
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
