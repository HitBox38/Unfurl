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
import { useJsonDataStore } from "../stores/JsonData";
import { NodeMetadataEditor } from "./NodeMetadataEditor";
import { StoryNode } from "../interfaces/Node";
import { ArrowRightAlt } from "@mui/icons-material";
import { useEffect } from "react";
import { tss } from "tss-react/mui";
interface StoryNodeForm extends Omit<StoryNode, "content"> {
  content: string;
}
const NodeEditor = () => {
  const { node, setNode } = UseNodeStore((state) => state);
  const jsonData = useJsonDataStore((state) => state);
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
  const { classes } = useStyles();

  const submitNode: SubmitHandler<StoryNodeForm> = (data) => {
    if (node && data.choices && data.content && data.metadata) {
      const newNode = {
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
      <Card className={classes.nodeEditorWrapper}>
        <CardHeader className={classes.formHeader} title={node?.name} />
        <form onSubmit={methods.handleSubmit(submitNode)}>
          <CardContent className={classes.nodeEditorForm}>
            <TextField
              {...methods.register("content")}
              className={classes.textArea}
              defaultValue={node?.content.join("\n")}
              multiline
              minRows={5}
              maxRows={15}
            />
            {fields.map((field, index) => (
              <Box className={classes.choiceWrapper} key={field.id}>
                <TextField
                  {...methods.register(`choices.${index}.text`)}
                  className={classes.choiceTextField}
                  defaultValue={field.text}
                  multiline
                />
                <ArrowRightAlt className={classes.referenceIcon} />
                <Typography variant="h5">{field.destination}</Typography>
              </Box>
            ))}
            <NodeMetadataEditor />
          </CardContent>
          <CardActions>
            <Button variant="contained" color="warning" onClick={() => setNode(null)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={!methods.formState.isDirty}>
              Update Node
            </Button>
            <Typography variant="body2" className={classes.warningText}>
              {methods.formState.isDirty ? "*Unsaved changes" : ""}
            </Typography>
          </CardActions>
        </form>
      </Card>
    </FormProvider>
  );
};

const useStyles = tss.create(({ theme }) => ({
  nodeEditorWrapper: {
    margin: "auto 0",
    height: "fit-content",
    width: "100%",
    maxWidth: "650px",
    padding: "10px",
  },
  formHeader: {
    textAlign: "start",
  },
  nodeEditorForm: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "start",
    gap: "30px",
  },
  textArea: {
    width: "100%",
  },
  choiceWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  referenceIcon: {
    fontSize: "50px",
  },
  choiceTextField: {
    width: "350px",
  },
  warningText: {
    padding: "0 5px",
    color: theme.palette.warning.main,
  },
}));

export default NodeEditor;
