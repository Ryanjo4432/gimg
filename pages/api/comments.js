import { connectToDB } from "@/utils/db";

export default async function handler(req, res) {
  const db = await connectToDB();

  if (req.method === "GET") {
    const { image_id } = req.query;

    if (!image_id) {
      return res.status(400).json({ message: "image_id is required" });
    }

    try {
      const [rows] = await db.query(
        "SELECT id, username AS name, content AS comment, image_id, created_at FROM comments WHERE image_id = ? ORDER BY created_at DESC",
        [image_id]
      );
      res.status(200).json({ comments: rows });
    } catch (err) {
      console.error("GET error:", err);
      res.status(500).json({ message: "Error fetching comments" });
    }

  } else if (req.method === "POST") {
    const { name, comment, image_id } = req.body;

    if (!comment || !image_id) {
      return res.status(400).json({ message: "Comment and image_id are required" });
    }

    try {
      // Insert comment
      const [result] = await db.query(
        "INSERT INTO comments (username, content, image_id) VALUES (?, ?, ?)",
        [name || "Guest", comment, image_id]
      );

      // Update comment count in images table (efficient increment)
      await db.query(
        "UPDATE images SET comment_count = IFNULL(comment_count, 0) + 1 WHERE id = ?",
        [image_id]
      );

      // Return the new comment
      const [newCommentRows] = await db.query(
        "SELECT id, username AS name, content AS comment, image_id, created_at FROM comments WHERE id = ?",
        [result.insertId]
      );

      res.status(200).json(newCommentRows[0]);
    } catch (err) {
      console.error("POST error:", err);
      res.status(500).json({ message: "Error saving comment" });
    }

  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
