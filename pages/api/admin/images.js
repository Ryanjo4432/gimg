import { connectToDB } from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const connection = await connectToDB();
  const [rows] = await connection.execute(
    'SELECT id, image_base64, uploaded_at, comment_count FROM images ORDER BY uploaded_at DESC'
  );
  connection.end();

  // Send base64 as is (without prefix)
  const images = rows.map(row => ({
    ...row,
    image_base64: row.image_base64, 
  }));

  res.status(200).json({ images });
}
