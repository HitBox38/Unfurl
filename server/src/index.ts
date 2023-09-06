import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index";

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));

app.use(cors({ origin: "*", credentials: true }));
// app.use(cors({ origin: "*", credentials: true }));

console.log("hello");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(express.static(path.join(__dirname, "../../client/build")));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`App running on port ${process.env.PORT || 3001}`);
});
