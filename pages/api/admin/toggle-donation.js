import { connectToDB } from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { showDonation } = req.body;

  if (typeof showDonation !== 'boolean') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const connection = await connectToDB();
  await connection.execute('UPDATE admin_config SET show_donation_section = ? WHERE id = 1', [showDonation ? 1 : 0]);
  connection.end();

  res.status(200).json({ success: true });
}
