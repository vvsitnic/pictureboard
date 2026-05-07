import express from "express";
import cors from "cors";
import multer from "multer";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./lib/auth.ts";
import { processImg, requireAuth } from "./lib/middleware.ts";
import {
  deletePicture,
  getPictures,
  getUserPictures,
  postPicture,
} from "./lib/pictureRequests.ts";
import "dotenv/config";

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

const router = express.Router();
router.get("/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});
router.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { files: 1, fileSize: 2_000_000 },
});

router.use("/static", express.static("uploads"));
router.post(
  "/picture",
  upload.single("picture"),
  requireAuth,
  processImg,
  postPicture,
);

router.use(express.json());
router.get("/pictures", getPictures);
router.get("/user-pictures", requireAuth, getUserPictures);
router.delete("/picture", requireAuth, deletePicture);

app.use("/api", router);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
