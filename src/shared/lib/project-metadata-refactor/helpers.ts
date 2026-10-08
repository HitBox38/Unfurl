import {
  metadataUndoKey,
  metadataUndoMaxBytes,
} from "@/shared/lib/metadata-refactor-storage";
import { STORAGE_EVENT } from "@/shared/hooks/use-storage";
import { EDITABLE_FILES_STORAGE_KEY } from "@/shared/lib/editable-files-storage/constants";
import { PROJECTS_STORAGE_KEY } from "@/shared/lib/projects-storage/constants";
import { isRecord } from "@/shared/lib/story-validation";

export const metadataTransactionKey = "unfurl:metadata-transaction:v1";

interface StorageTransaction {
  version: 1;
  before: Record<string, string | null>;
}

export const pruneMetadataUndo = (storage: Storage = localStorage) => {
  const keys = Array.from({ length: storage.length }, (_, index) =>
    storage.key(index),
  );
  for (const key of keys) {
    if (!key?.startsWith(metadataUndoKey(""))) continue;
    const raw = storage.getItem(key);
    let expiresAt: unknown;
    try {
      expiresAt = raw ? JSON.parse(raw).expiresAt : null;
    } catch {
      /* Unreadable undo snapshots cannot be applied. */
    }
    if (
      !raw ||
      raw.length * 2 > metadataUndoMaxBytes ||
      typeof expiresAt !== "number" ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    )
      storage.removeItem(key);
  }
};

const readTransaction = (raw: string): StorageTransaction => {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.before))
    throw new Error("Unsupported journal format.");
  const before = value.before;
  if (
    !Object.hasOwn(before, EDITABLE_FILES_STORAGE_KEY) ||
    !Object.hasOwn(before, PROJECTS_STORAGE_KEY)
  )
    throw new Error("Incomplete journal.");
  for (const [key, snapshot] of Object.entries(before)) {
    if (
      key !== EDITABLE_FILES_STORAGE_KEY &&
      key !== PROJECTS_STORAGE_KEY &&
      !key.startsWith(metadataUndoKey(""))
    )
      throw new Error("Unexpected journal storage key.");
    if (snapshot !== null && typeof snapshot !== "string")
      throw new Error("Invalid journal snapshot.");
    if (typeof snapshot === "string") JSON.parse(snapshot);
  }
  return { version: 1, before: before as StorageTransaction["before"] };
};

const writeEntries = (
  storage: Storage,
  entries: Record<string, string | null>,
) => {
  for (const [key, value] of Object.entries(entries)) {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  }
};

const notifyEntries = (entries: Record<string, string | null>) => {
  if (typeof window === "undefined") return;
  for (const [key, raw] of Object.entries(entries))
    window.dispatchEvent(
      new CustomEvent(STORAGE_EVENT, {
        detail: { key, newValue: raw === null ? null : JSON.parse(raw) },
      }),
    );
};

export const recoverMetadataTransaction = (storage: Storage = localStorage) => {
  try {
    const raw = storage.getItem(metadataTransactionKey);
    if (!raw) {
      pruneMetadataUndo(storage);
      return null;
    }
    let transaction: StorageTransaction;
    try {
      transaction = readTransaction(raw);
    } catch {
      const archiveKey = `${metadataTransactionKey}:unreadable:${crypto.randomUUID()}`;
      try {
        storage.setItem(archiveKey, raw);
        storage.removeItem(metadataTransactionKey);
      } catch {
        /* Keep the original key when there is no space to preserve another copy. */
      }
      return "The interrupted metadata refactor journal could not be read. Its raw copy has been preserved in local storage. Your saved stories remain available; the refactor may need manual recovery.";
    }
    writeEntries(storage, transaction.before);
    storage.removeItem(metadataTransactionKey);
    notifyEntries(transaction.before);
    pruneMetadataUndo(storage);
    return null;
  } catch {
    return "The interrupted metadata refactor could not be recovered. Its journal has been kept for another recovery attempt. Your saved stories remain available.";
  }
};

export const commitStorageTransaction = (
  storage: Storage,
  after: Record<string, string | null>,
) => {
  const warning = recoverMetadataTransaction(storage);
  if (warning) throw new Error(warning);
  const before = Object.fromEntries(
    Object.keys(after).map((key) => [key, storage.getItem(key)]),
  );
  const transaction: StorageTransaction = { version: 1, before };
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

export {
  metadataUndoKey,
  metadataUndoLifetime,
  metadataUndoMaxBytes,
} from "@/shared/lib/metadata-refactor-storage";
