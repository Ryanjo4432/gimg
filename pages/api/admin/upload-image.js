import { connectToDB } from '@/utils/db';

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '5mb' // Set desired value here
      }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const connection = await connectToDB();
    await connection.execute(
      'INSERT INTO images (image_base64) VALUES (?)',
      [imageBase64]
    );
    connection.end();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('DB insert error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
