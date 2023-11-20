import { ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import FileUpload from "./components/FileUpload";
import { UseJsonDataStore } from "./stores/JsonData";
import DownloadButton from "./components/DownloadButton";
import DialogViewer from "./components/DialogViewer";
import { UseNodeStore } from "./stores/Node";
import NodeEditor from "./components/NodeEditor";
import { darkTheme } from "./theme";
import { Button, CircularProgress } from "@mui/material";
import { ArrowRightAlt } from "@mui/icons-material";
import { MetadataConfig } from "./components/MetadataConfig";
import { EveryWhereDialog } from "./components/EverywhereDialog";

function App() {
  const [count, setCount] = useState(0);
  const { name, isLoading } = UseJsonDataStore((state) => state);
  const { node } = UseNodeStore((state) => state);

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>
        Twee <ArrowRightAlt sx={{ fontSize: 75, marginBottom: "-25px" }} /> JSON
      </h1>
      {name === "" ? (
        <FileUpload />
      ) : (
        <button onClick={() => window.location.reload()}>Upload another file</button>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          margin: "0 auto",
          width: "80vw",
          padding: "15px 0",
        }}>
        {name !== "" ? (
          <>
            <DialogViewer /> {node && <NodeEditor />}
          </>
        ) : (
          isLoading && <CircularProgress />
        )}
      </div>
      {name !== "" ? <DownloadButton /> : <MetadataConfig />}
      <EveryWhereDialog />
    </ThemeProvider>
  );
}

export default App;
