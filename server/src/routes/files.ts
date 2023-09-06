import { Router } from "express";
import { uploadFile } from "../controllers/files";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadFile);
// router.get("/getFile/:id", fetch);

export default router;
