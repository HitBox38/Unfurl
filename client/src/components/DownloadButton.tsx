import { UseJsonDataStore } from "../Store/JsonData";
import { Button } from "@mui/material";

const DownloadButton = () => {
  const { content, name } = UseJsonDataStore((state) => state);

  const handleDownload = () => {
    if (content) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${name}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  return (
    <Button variant="contained" onClick={handleDownload}>
      DownloadButton
    </Button>
  );
};

export default DownloadButton;
