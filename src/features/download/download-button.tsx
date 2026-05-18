import { useJsonDataStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

export const DownloadButton = () => {
  const content = useJsonDataStore((state) => state.content);
  const name = useJsonDataStore((state) => state.name);

  const handleDownload = () => {
    if (!content) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${name}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return <Button onClick={handleDownload}>Download</Button>;
};
