// pages/api/admin/config.js
import { connectToDB } from '@/utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const connection = await connectToDB();
    const [rows] = await connection.execute('SELECT show_donation_section, donation_link FROM admin_config WHERE id = 1');
    connection.end();

    if (rows.length > 0) {
      res.status(200).json({
        showDonation: !!rows[0].show_donation_section,
        donationLink: rows[0].donation_link || null,
      });
    } else {
      res.status(404).json({ error: 'Config not found' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
