import { Controller, SubmitHandler, useFieldArray, useFormContext } from "react-hook-form";
import useLocalStorage from "../hooks/useLocalStorage";
import { Box } from "@mui/system";
import { Button, IconButton, MenuItem, Select, TextField } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import { useEffect } from "react";

export const MetadataConfigForm = () => {
  const [config] = useLocalStorage<MetadataConfigTemplate>("metadataConfig", {
    config: [],
  });
  const { control, register, reset } = useFormContext<MetadataConfigTemplate>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config",
  });

  useEffect(() => {
    if (config) {
      reset(config);
    }
  }, [config]);

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-evenly" alignItems="center">
      <Box display="flex" flexDirection="column" justifyContent="space-evenly" alignItems="center">
        {fields.map((line, index) => (
          <Box
            key={line.id}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="baseline"
            flexWrap="nowrap"
            sx={{ width: "700px" }}>
            <TextField {...register(`config.${index}.name`)} label="Name" sx={{ width: "250px" }} />
            <TextField
              {...register(`config.${index}.sign`)}
              helperText="Use a set of symbols that won't repeat in the dialog"
              sx={{ width: "200px" }}
            />
            <Controller
              name={`config.${index}.type`}
              control={control}
              render={(field) => (
                <Select {...field} sx={{ width: "106px" }}>
                  <MenuItem value=""></MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                </Select>
              )}
            />
            <IconButton color="error" onClick={() => remove(index)}>
              <Delete />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => append({ name: "", sign: "", type: "number" })}>
          Add
        </Button>
      </Box>
    </Box>
  );
};
