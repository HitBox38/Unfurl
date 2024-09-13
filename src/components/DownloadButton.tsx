import { UseJsonDataStore } from "../stores/JsonData";
import { Button } from "@mui/material";

const DownloadButton = () => {
  const { content, name } = UseJsonDataStore((state) => state);

  const handleDownload = () => {
    if (content) {
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${name}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  return (
    <Button variant="contained" onClick={handleDownload}>
      Download
    </Button>
  );
};

export default DownloadButton;
