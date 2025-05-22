import { tss } from "tss-react";
import { DialogStore } from "../stores/DialogStore";
import { Link, Typography } from "@mui/material";

export const useFaqModal = (): Omit<DialogStore, "setOpen" | "setContent"> => {
  const { classes } = useStyles();

  return {
    content: (
      <>
        <div>
          <Typography variant="h6">What is Unfurl?</Typography>
          <Typography variant="body1">
            The tool that can take your extensive dialogs you wrote in Twine or in other markdown
            formats and visualize, edit and convert them to a JSON format for your game!
          </Typography>
        </div>
        <div>
          <Typography variant="h6">How do I use these files in my game?</Typography>
          <Typography variant="body1">
            You can use these files in your game by importing them as a JSON file. This can change
            depending on the engine you are using. For example, in Unity, you'll need to build your
            own dialog manager and import the JSON file as a text asset.
          </Typography>
        </div>
        <div>
          <Typography variant="h6">Can I use Unfurl for my own project?</Typography>
          <Typography variant="body1">
            <span className={classes.boldText}>Yes!</span> Unfurl is open-source and free to use.
            You can find the source code on{" "}
            <Link
              className={classes.link}
              href="https://github.com/HitBox38/Unfurl"
              target="_blank">
              GitHub
            </Link>
            .
          </Typography>
        </div>
        <div>
          <Typography variant="h6">What are the supported formats?</Typography>
          <Typography variant="body1">Unfurl supports the following formats: </Typography>

          <ul>
            <li>
              <Typography variant="body1" className={classes.boldText}>
                twee (Twine)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" className={classes.boldText}>
                markdown (.md files, compatible with tools like Obsidian)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" className={classes.boldText}>
                JSON
              </Typography>
            </li>
          </ul>
        </div>
        <div>
          <Typography variant="h6">How can I contribute?</Typography>
          <Typography variant="body1">
            Unfurl is open-source and free to use. You can find the source code on{" "}
            <Link
              className={classes.link}
              href="https://github.com/HitBox38/Unfurl"
              target="_blank">
              GitHub
            </Link>
            . If you find a bug or have a feature request,{" "}
            <Link
              className={classes.link}
              href="https://github.com/HitBox38/Unfurl/issues"
              target="_blank">
              you can create an issue on GitHub
            </Link>
            .
          </Typography>
        </div>
      </>
    ),
    isOpen: true,
    title: "FAQ",
    functions: [],
    classNames: {
      dialog: classes.dialog,
      dialogContent: classes.dialogContent,
    },
  };
};

const useStyles = tss.create(() => ({
  dialog: {
    "& .MuiDialog-paper": {
      overflowY: "hidden",
    },
  },
  dialogContent: {
    maxHeight: "70vh",
    maxWidth: "50vw",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  boldText: {
    fontWeight: "bolder",
  },
  link: {
    cursor: "pointer",
  },
}));
