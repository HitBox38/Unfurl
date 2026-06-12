export const fileExtension = (file: File): string => {
  const parts = file.name.split(".");
  return parts[parts.length - 1];
};
