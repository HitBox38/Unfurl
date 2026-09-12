/**
 * Triggers a browser download of `data` serialized as pretty-printed JSON.
 * Uses a data URI rather than a Blob URL so it needs no cleanup and works in
 * jsdom, the web build, and Electron's renderer alike.
 */
export const downloadJsonFile = (fileName: string, data: unknown) => {
  const anchor = document.createElement("a");
  anchor.href =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data, null, 2));
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};
