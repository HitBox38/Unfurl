import { ThemeProvider } from "@mui/material/styles";
import UnfurlLogo from "./assets/UnfurlLogo.png";
import "./App.css";
import FileUpload from "./components/FileUpload";
import { UseJsonDataStore } from "./stores/JsonData";
import DownloadButton from "./components/DownloadButton";
import { UseNodeStore } from "./stores/Node";
import { darkTheme } from "./theme";
import { AppBar, CircularProgress, Toolbar, Typography } from "@mui/material";
import { MetadataConfig } from "./components/MetadataConfig";
import styled, { keyframes } from "styled-components";
import { useDialogStore } from "./stores/DialogStore";
import useKeyboardShortcut from "./hooks/useKeyboardShortcut";
import { useMetadataConfigFormModal } from "./modals/MetadataConfigFormModal";
import { lazy } from "react";
import NodeEditor from "./components/NodeEditor";
import { EveryWhereDialog } from "./components/EverywhereDialog";

const DialogViewer = lazy(() => import("./components/DialogViewer"));

const App = () => {
  const { name, isLoading } = UseJsonDataStore((state) => state);
  const { node } = UseNodeStore((state) => state);
  const { setContent } = useDialogStore((state) => state);
  const content = useMetadataConfigFormModal();

  useKeyboardShortcut(() => setContent(content), { codes: ["KeyC", "KeyF"], ctrlKey: true });

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar sx={{ WebkitAppRegion: "drag", zIndex: "999" }}>
        <Toolbar variant="dense" sx={{ backgroundColor: "#3d3d3d" }}>
          <Typography variant="h6">Unfurl</Typography>
        </Toolbar>
      </AppBar>
      <div>
        <img src={UnfurlLogo} className="logo" alt="Unfurl logo" aria-label="logo" />
      </div>
      <Typography variant="h3" fontWeight={"bold"}>
        Unfurl
      </Typography>
      <StyledRotatorWrapper variant="h5" display="flex" flexDirection="row" justifyContent="center">
        <StyledSpan>
          <span>Twee</span>
          <span>Obsidian</span>
          <span>md</span>
          <span>JSON</span>
          <span>Twee</span>
        </StyledSpan>
        Convertor & Editor
      </StyledRotatorWrapper>
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

const rotateWords = keyframes`
    10% {
      transform: translateY(-112%);
    }
    25% {
      transform: translateY(-100%);
    }
    35% {
      transform: translateY(-212%);
    }
    50% {
      transform: translateY(-200%);
    }
    60% {
      transform: translateY(-312%);
    }
    75% {
      transform: translateY(-300%);
    }
    85% {
      transform: translateY(-412%);
    }
    100% {
      transform: translateY(-400%);
    }
`;

const StyledRotatorWrapper = styled(Typography)`
  box-sizing: content-box;
  height: 27px;

  & span {
    display: block;
    height: 100%;
    padding-right: 10px;
    animation: ${rotateWords} 6s infinite;
  }
`;

const StyledSpan = styled.div`
  overflow: hidden;
`;

export default App;
