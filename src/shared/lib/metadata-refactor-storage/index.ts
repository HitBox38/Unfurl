export const metadataUndoKey = (projectId: string) =>
  `unfurl:metadata-undo:v1:${projectId}`;
export const metadataUndoMaxBytes = 512 * 1024;
export const metadataUndoLifetime = 7 * 24 * 60 * 60 * 1000;
