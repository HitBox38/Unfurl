import { ThemeProvider } from "@mui/material/styles";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";
import "./App.css";
import FileUpload from "./components/FileUpload";
import { UseJsonDataStore } from "./stores/JsonData";
import DownloadButton from "./components/DownloadButton";
import DialogViewer from "./components/DialogViewer";
import { UseNodeStore } from "./stores/Node";
import NodeEditor from "./components/NodeEditor";
import { darkTheme } from "./theme";
import { AppBar, CircularProgress, Toolbar, Typography } from "@mui/material";
import { MetadataConfig } from "./components/MetadataConfig";
import { EveryWhereDialog } from "./components/EverywhereDialog";

const App = () => {
  const { name, isLoading } = UseJsonDataStore((state) => state);
  const { node } = UseNodeStore((state) => state);

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar sx={{ "-webkit-app-region": "drag", zIndex: "999" }}>
        <Toolbar variant="dense" sx={{ backgroundColor: "#3d3d3d" }}>
          <Typography variant="h6">Unfurl</Typography>
        </Toolbar>
      </AppBar>
      <div>
        <a href="https://electron-vite.github.io" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <Typography variant="h3" fontWeight={"bold"}>
        Unfurl
      </Typography>
      <Typography variant="h5">Twee to JSON Convertor & Editor</Typography>
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
};

export default App;
