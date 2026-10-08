import { STORAGE_EVENT } from "@/shared/hooks/use-storage";

export const metadataTransactionKey = "unfurl:metadata-transaction:v1";
export const metadataUndoKey = (projectId: string) => `unfurl:metadata-undo:v1:${projectId}`;

interface StorageTransaction {
  version: 1;
  before: Record<string, string | null>;
  after: Record<string, string | null>;
}

const writeEntries = (storage: Storage, entries: Record<string, string | null>) => {
  for (const [key, value] of Object.entries(entries)) {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  }
};

const notifyEntries = (entries: Record<string, string | null>) => {
  if (typeof window === "undefined") return;
  for (const [key, raw] of Object.entries(entries)) window.dispatchEvent(new CustomEvent(STORAGE_EVENT, {
    detail: { key, newValue: raw === null ? null : JSON.parse(raw) },
  }));
};

export const recoverMetadataTransaction = (storage: Storage = localStorage) => {
  const raw = storage.getItem(metadataTransactionKey);
  if (!raw) return;
  const transaction = JSON.parse(raw) as StorageTransaction;
  if (transaction.version !== 1 || !transaction.before || !transaction.after) throw new Error("The interrupted metadata refactor could not be recovered.");
  writeEntries(storage, transaction.before);
  storage.removeItem(metadataTransactionKey);
  notifyEntries(transaction.before);
};

export const commitStorageTransaction = (storage: Storage, after: Record<string, string | null>) => {
  recoverMetadataTransaction(storage);
  const before = Object.fromEntries(Object.keys(after).map((key) => [key, storage.getItem(key)]));
  const transaction: StorageTransaction = { version: 1, before, after };
  // Separate storage keys need a journal to recover an interrupted project-wide write.
  storage.setItem(metadataTransactionKey, JSON.stringify(transaction));
  try {
    writeEntries(storage, after);
    storage.removeItem(metadataTransactionKey);
  } catch (error) {
    writeEntries(storage, before);
    storage.removeItem(metadataTransactionKey);
    throw error;
  }
  notifyEntries(after);
};
