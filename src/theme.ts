import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    // Add more custom colors if needed
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Customize typography variants
    h1: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    // Add more typography customizations if needed
  },
  // Add more theme options such as breakpoints, shape, transitions, etc.
});
