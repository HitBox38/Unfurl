export type AnalyticsConsent = "pending" | "granted" | "denied";
export type AnalyticsFormat = "twee" | "obsidian" | "json" | "unknown";
export type NodeCountBucket = "0" | "1-20" | "21-100" | "100+";
export type AnalyticsError =
  | "invalid_json"
  | "invalid_story"
  | "missing_title"
  | "unsupported_format"
  | "storage"
  | "conversion"
  | "download";

type Transfer = {
  format: AnalyticsFormat;
  node_count_bucket?: NodeCountBucket;
};
export type AnalyticsEvents = {
  app_opened: Record<string, never>;
  demo_loaded: { source: "button" | "konami" };
  import_succeeded: Transfer & { node_count_bucket: NodeCountBucket };
  import_failed: Transfer & { error_class: AnalyticsError };
  export_succeeded: { format: "json"; node_count_bucket: NodeCountBucket };
  export_failed: {
    format: "json";
    node_count_bucket: NodeCountBucket;
    error_class: "download";
  };
  first_graph_edit: Record<string, never>;
  recent_file_opened: Record<string, never>;
};
