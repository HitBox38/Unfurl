import { ThemeProvider } from "@mui/material/styles";
import UnfurlLogo from "./assets/UnfurlLogo.png";
import FileUpload from "./components/FileUpload";
import { useJsonDataStore } from "./stores/JsonData";
import DownloadButton from "./components/DownloadButton";
import { UseNodeStore } from "./stores/Node";
import { darkTheme } from "./theme";
import { AppBar, Box, Button, CircularProgress, Toolbar, Typography } from "@mui/material";
import { MetadataConfig } from "./components/MetadataConfig";
import { keyframes } from "tss-react";
import { useDialogStore } from "./stores/DialogStore";
import useKeyboardShortcut from "./hooks/useKeyboardShortcut";
import { useMetadataConfigFormModal } from "./modals/MetadataConfigFormModal";
import NodeEditor from "./components/NodeEditor";
import { EveryWhereDialog } from "./components/EverywhereDialog";
import ItchIoLogo from "./assets/itchio-logo.svg";
import DialogViewer from "./components/DialogViewer";
import { tss } from "tss-react/mui";
import { useFaqModal } from "./modals/faqModal";

const App = () => {
  const { name, isLoading } = useJsonDataStore((state) => state);
  const { node } = UseNodeStore((state) => state);
  const { setContent } = useDialogStore((state) => state);
  const metadataConfigForm = useMetadataConfigFormModal();
  const faqModal = useFaqModal();
  const { classes } = useStyles();
  const isOnline =
    location.hostname.includes(".vercel.app") && location.hostname.includes("unfurl");

  useKeyboardShortcut(() => setContent(metadataConfigForm), {
    codes: ["KeyC", "KeyF"],
    ctrlKey: true,
  });

  return (
    <ThemeProvider theme={darkTheme}>
      {!isOnline ? (
        <AppBar className={classes.appBar}>
          <Toolbar variant="dense" className={classes.toolbar}>
            <Typography variant="h6">Unfurl</Typography>
          </Toolbar>
        </AppBar>
      ) : null}
      <img src={UnfurlLogo} className={classes.logo} alt="Unfurl logo" aria-label="logo" />
      <Box className={classes.appWrapper}>
        <Typography variant="h3" fontWeight={"bold"}>
          Unfurl{isOnline ? " Online" : ""}
        </Typography>
        <Typography variant="h5" className={classes.rotatorWrapper}>
          <Box className={classes.spanWrapper}>
            <span>Twee</span>
            <span>Obsidian</span>
            <span>md</span>
            <span>JSON</span>
            <span>Twee</span>
          </Box>
          Convertor & Editor
        </Typography>
        {name === "" ? (
          <FileUpload />
        ) : (
          <Button variant="contained" color="secondary" onClick={() => location.reload()}>
            Upload another file
          </Button>
        )}
        <Box className={classes.editorsWrapper}>
          {name !== "" ? (
            <>
              <DialogViewer /> {node && <NodeEditor />}
            </>
          ) : (
            isLoading && <CircularProgress />
          )}
        </Box>
        <Box className={classes.lowerButtons}>
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
          <Button variant="contained" color="info" onClick={() => setContent(faqModal)}>
            FAQ
          </Button>
        </Box>
      </Box>
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

const useStyles = tss.create(() => ({
  appBar: {
    WebkitAppRegion: "drag",
    zIndex: "999",
  },
  toolbar: {
    backgroundColor: "#3d3d3d",
  },
  logo: {
    height: "8em",
    padding: "1.5em",
    willChange: "filter",
    transition: "filter 300ms",
    "&:hover": {
      filter: "drop-shadow(0 0 2em #646cffaa)",
    },
  },
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: "15px",
  },
  rotatorWrapper: {
    boxSizing: "content-box",
    height: "27px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  spanWrapper: {
    overflow: "hidden",
    "& > span": {
      display: "block",
      height: "100%",
      paddingRight: "10px",
      textAlign: "right",
      animation: `${rotateWords} 6s infinite`,
    },
  },
  editorsWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    margin: "0 auto",
    width: "80vw",
    padding: "15px 0",
  },
  lowerButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },
}));

export default App;
