const { isValid, parse } = require('@telegram-apps/init-data-node');
const pool = require('../db/pool');

const BOT_TOKEN = process.env.BOT_TOKEN;

async function authHandler(req, res) {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ success: false, error: 'initData is missing' });
  }

  const valid = isValid(initData, BOT_TOKEN);

  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid initData' });
  }

  const user = parse(initData).user;

  // Здесь можешь потом добавить логику работы с базой, например сохранение user в БД.

  res.json({
    success: true,
    user,
  });
}

module.exports = { authHandler };
