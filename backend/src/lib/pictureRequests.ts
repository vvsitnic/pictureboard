import express from "express";
import pool from "./db.ts";
import "dotenv/config";
import { unlink } from "node:fs";

export async function postPicture(req: express.Request, res: express.Response) {
  try {
    const result = await pool.query(
      "INSERT INTO pictures (picture_id, user_id, width, height, text_for_picture) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [
        req.body.picture.pictureId,
        (req as any).session.user.id,
        req.body.picture.metadata.width,
        req.body.picture.metadata.height,
        req.body.textForPicture,
      ],
    );

    res.json({ message: "success", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpreced error occured" });
  }
}

export async function getPictures(req: express.Request, res: express.Response) {
  try {
    const result = await pool.query(
      "SELECT id, CONCAT($1::text, picture_id, $2::text) AS picture_url, width, height, text_for_picture FROM pictures ORDER BY created_at DESC", // LIMIT $1 OFFSET $1 * $2
      [process.env.PICTURE_FILE_URI, process.env.PICTURE_FILE_MIME_TYPE],
    );

    res.json({ message: "success", data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpreced error occured" });
  }
}

export async function getUserPictures(
  req: express.Request,
  res: express.Response,
) {
  try {
    const result = await pool.query(
      "SELECT id, CONCAT($1::text, picture_id, $2::text) AS picture_url, width, height, text_for_picture FROM pictures WHERE user_id = $3 ORDER BY created_at DESC",
      [
        process.env.PICTURE_FILE_URI,
        process.env.PICTURE_FILE_MIME_TYPE,
        (req as any).session.user.id,
      ],
    );

    res.json({ message: "success", data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpreced error occured" });
  }
}

export async function deletePicture(
  req: express.Request,
  res: express.Response,
) {
  try {
    if (!req.query.id)
      return res.status(400).json({ message: "Id is missing." });

    const result = await pool.query(
      "DELETE FROM pictures where id = $1 AND user_id = $2 RETURNING picture_id",
      [req.query.id, (req as any).session.user.id],
    );

    if (!result.rows[0].picture_id)
      throw new Error(`pic del - no id - ${req.query.id}`);

    unlink(`uploads/${result.rows[0].picture_id}.jpeg`, (err) => {
      if (err) throw err;
    });

    res.json({ message: "success", data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpreced error occured" });
  }
}
