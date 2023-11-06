import { TextareaAutosize, TextField, Typography, Box, Button } from "@mui/material";
import { UseNodeStore } from "../Store/Node";
import { useForm, useFieldArray } from "react-hook-form";
import { UseJsonDataStore } from "../Store/JsonData";
import { useEffect } from "react";

const NodeEditor = () => {
  const { node, setNode } = UseNodeStore((state) => state);
  const jsonData = UseJsonDataStore((state) => state);
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      content: node?.content.join("\n"),
      choices: node?.choices,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "choices",
  });

  const submitNode = (data: {
    content?: string;
    choices?: { text: string; destination: string }[];
  }) => {
    if (node && data.choices && data.content) {
      console.log(data);

      setNode({ ...node, content: data.content.split("\n"), choices: data.choices });
      jsonData.setNode(node, jsonData);
    } else {
      console.log("node is empty!");
    }
  };

  useEffect(() => {
    if (node) {
      reset({
        content: node.content.join("\n"),
        choices: node.choices,
      });
    }
  }, [node, reset]);

  return (
    <Box
      sx={{ border: "1px solid #f6f6f6", borderRadius: 10, minWidth: "500px" }}
      component="form"
      onSubmit={handleSubmit(submitNode)}
      display="flex"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center">
      <Typography variant="h3">{node?.name}</Typography>
      <TextareaAutosize
        {...register("content")}
        defaultValue={node?.content.join("\n")}
        onChange={(e) => {
          if (node) {
            setNode({ ...node, content: e.target.value.split("\n") });
          }
        }}
        minRows={5}
        style={{ minWidth: "500px" }}
      />
      {fields.map((field, index) => (
        <Box
          key={field.id}
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          flexWrap="nowrap"
          paddingX="10px"
          // paddingY="15px"
        >
          <TextField
            sx={{ width: "450px" }}
            {...register(`choices.${index}.text`)}
            defaultValue={field.text}
          />
          <Typography variant="h4"> ➡ </Typography>
          <Typography variant="h5">{field.destination}</Typography>
        </Box>
      ))}
      <Button variant="contained" type="submit">
        Update Node
      </Button>
    </Box>
  );
};

export default NodeEditor;
