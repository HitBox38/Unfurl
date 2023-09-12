import { UseJsonDataStore } from "../Store/JsonData";

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

  return <button onClick={handleDownload}>DownloadButton</button>;
};

export default DownloadButton;
