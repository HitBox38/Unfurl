import { ThemeProvider } from "@mui/material/styles";
import UnfurlLogo from "./assets/UnfurlLogo.png";
import "./App.css";
import FileUpload from "./components/FileUpload";
import { UseJsonDataStore } from "./stores/JsonData";
import DownloadButton from "./components/DownloadButton";
import { UseNodeStore } from "./stores/Node";
import { darkTheme } from "./theme";
import { AppBar, Box, Button, CircularProgress, Toolbar, Typography } from "@mui/material";
import { MetadataConfig } from "./components/MetadataConfig";
import styled, { keyframes } from "styled-components";
import { useDialogStore } from "./stores/DialogStore";
import useKeyboardShortcut from "./hooks/useKeyboardShortcut";
import { useMetadataConfigFormModal } from "./modals/MetadataConfigFormModal";
import { lazy } from "react";
import NodeEditor from "./components/NodeEditor";
import { EveryWhereDialog } from "./components/EverywhereDialog";
import ItchIoLogo from "./assets/itchio-logo.svg";

const DialogViewer = lazy(() => import("./components/DialogViewer"));

const App = () => {
  const { name, isLoading } = UseJsonDataStore((state) => state);
  const { node } = UseNodeStore((state) => state);
  const { setContent } = useDialogStore((state) => state);
  const content = useMetadataConfigFormModal();
  const isOnline =
    location.hostname.includes(".vercel.app") && location.hostname.includes("unfurl");

  useKeyboardShortcut(() => setContent(content), { codes: ["KeyC", "KeyF"], ctrlKey: true });

  return (
    <ThemeProvider theme={darkTheme}>
      {!isOnline ? (
        <AppBar sx={{ WebkitAppRegion: "drag", zIndex: "999" }}>
          <Toolbar variant="dense" sx={{ backgroundColor: "#3d3d3d" }}>
            <Typography variant="h6">Unfurl</Typography>
          </Toolbar>
        </AppBar>
      ) : null}
      <img src={UnfurlLogo} className="logo" alt="Unfurl logo" aria-label="logo" />
      <AppWrapper>
        <Typography variant="h3" fontWeight={"bold"}>
          Unfurl{isOnline ? " Online" : ""}
        </Typography>
        <StyledRotatorWrapper variant="h5">
          <StyledSpanWrapper>
            <span>Twee</span>
            <span>Obsidian</span>
            <span>md</span>
            <span>JSON</span>
            <span>Twee</span>
          </StyledSpanWrapper>
          Convertor & Editor
        </StyledRotatorWrapper>
        {name === "" ? (
          <FileUpload />
        ) : (
          <button onClick={() => location.reload()}>Upload another file</button>
        )}
        <EditorsWrapper>
          {name !== "" ? (
            <>
              <DialogViewer /> {node && <NodeEditor />}
            </>
          ) : (
            isLoading && <CircularProgress />
          )}
        </EditorsWrapper>
        <LowerButtons>
          {name !== "" ? <DownloadButton /> : <MetadataConfig />}
          {isOnline && (
            <Button
              startIcon={<ItchIoLogo />}
              href="https://hit-box38.itch.io/unfurl"
              variant="contained"
              color="secondary">
              Get the Desktop version
            </Button>
          )}
        </LowerButtons>
      </AppWrapper>
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
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const StyledSpanWrapper = styled.div`
  overflow: hidden;

  & > span {
    display: block;
    height: 100%;
    padding-right: 10px;
    text-align: right;
    animation: ${rotateWords} 6s infinite;
  }
`;

const AppWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 15px;
`;

const EditorsWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin: 0 auto;
  width: 80vw;
  padding: 15px 0;
`;

const LowerButtons = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

export default App;
