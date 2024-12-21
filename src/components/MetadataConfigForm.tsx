import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useStorage } from "../hooks/useStorage";
import { Box } from "@mui/system";
import { Button, IconButton, MenuItem, Select, TextField } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import { useEffect } from "react";
import { tss } from "tss-react/mui";

export const MetadataConfigForm = () => {
  const [config] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: {
      config: [],
    },
  });
  const { control, register, reset } = useFormContext<MetadataConfigTemplate>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config",
  });

  const { classes } = useStyles();

  useEffect(() => {
    console.log("useEffect", config);

    if (config && config.config.length > 0) {
      reset(config);
    }
  }, [config, reset]);

  return (
    <Box className={classes.root}>
      {fields.map((line, index) => (
        <Box key={line.id} className={classes.field}>
          <TextField
            {...register(`config.${index}.name`, { required: true })}
            label="Name"
            className={classes.nameInput}
          />
          <TextField
            {...register(`config.${index}.sign`, { required: true })}
            label="Sign"
            helperText="Use a set of symbols that won't repeat in the dialog"
            className={classes.signInput}
          />
          <Controller
            name={`config.${index}.type`}
            defaultValue={line.type}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field} className={classes.select} label="Type">
                <MenuItem value="" disabled>
                  Select Type
                </MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </Select>
            )}
          />
          <TextField
            {...register(`config.${index}.label`)}
            label="Label"
            className={classes.labelInput}
          />
          <IconButton color="error" onClick={() => remove(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button
        variant="contained"
        color="secondary"
        onClick={() => append({ name: "", sign: "", type: "number", label: "" })}>
        Add
      </Button>
    </Box>
  );
};

const useStyles = tss.create(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: "10px",
    paddingTop: "10px",
  },
  field: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    flexWrap: "nowrap",
    gap: "5px",
    minWidth: "700px",
  },
  nameInput: {
    width: "250px",
  },
  signInput: {
    width: "200px",
  },
  select: {
    width: "106px",
  },
  labelInput: {
    width: "250px",
  },
}));
