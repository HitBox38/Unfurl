export interface MetadataConfigTemplate {
  config: {
    name: string;
    sign: string;
    type: "number" | "boolean";
  }[];
}
