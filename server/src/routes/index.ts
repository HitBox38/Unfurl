import { Router } from "express";
import files from "./files";

const router = Router();

router.use("/files", files);

export default router;
