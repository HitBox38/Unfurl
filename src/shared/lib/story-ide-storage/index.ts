export const workspaceStorageKey = (fileId: string) => `unfurl:story-ide:v1:${fileId}`;
export const workspaceViewKey = (fileId: string) => `unfurl:story-ide-view:v1:${fileId}`;

export const removeStoryIdeStorage = (fileId: string, storage: Storage) => {
  const draftKey = workspaceStorageKey(fileId);
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  for (const key of keys) {
    if (key && (key === draftKey || key.startsWith(`${draftKey}:`) || key === workspaceViewKey(fileId))) storage.removeItem(key);
  }
};
