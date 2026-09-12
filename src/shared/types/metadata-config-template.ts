export type MetadataFieldType = "number" | "boolean";

export interface MetadataField {
  name: string;
  sign: string;
  type: MetadataFieldType;
  label?: string;
}

export interface MetadataConfigTemplate {
  config: MetadataField[];
}
