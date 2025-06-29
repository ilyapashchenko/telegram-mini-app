const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function getUserByTelegramId(tgId) {
  const result = await pool.query('SELECT * FROM users WHERE tg_id = $1', [tgId]);
  return result.rows[0];
}

async function createUser(user) {
  const result = await pool.query(
    'INSERT INTO users (tg_id, first_name, last_name, language_code, photo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [user.id, user.firstName, user.lastName, user.languageCode, user.photoUrl]
  );
  return result.rows[0];
}

module.exports = {
  getUserByTelegramId,
  createUser,
};
