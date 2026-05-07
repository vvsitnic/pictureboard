import express from "express";
import sharp from "sharp";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.ts";
import "dotenv/config";

export async function processImg(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  const pictureId = crypto.randomUUID();

  try {
    const metadata = await sharp(req.file.buffer).metadata();
    await sharp(req.file.buffer)
      .toFormat("jpeg")
      .jpeg()
      .toFile(`uploads/${pictureId}.jpeg`);

    req.body.picture = { pictureId, metadata };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing image." });
  }
}

export async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).session = session;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occured." });
  }
}
