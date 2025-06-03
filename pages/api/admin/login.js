import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  const connection = await mysql.createConnection(dbConfig);

  // Check for matching username AND password directly
  const [rows] = await connection.execute(
    'SELECT * FROM admin_users WHERE username = ? AND password_hash = ?',
    [username, password]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const admin = rows[0];

  res.status(200).json({
    success: true,
    adminId: admin.id,
    username: admin.username,
  });
}
