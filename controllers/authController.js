const { isValid, parse } = require('@telegram-apps/init-data-node');
const { getUserByTelegramId, createUser } = require('../db/userModel');

const BOT_TOKEN = process.env.BOT_TOKEN;

async function authHandler(req, res) {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ success: false, error: 'initData missing' });
  }

  const valid = isValid(initData, BOT_TOKEN);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid initData' });
  }

  const user = parse(initData).user;

  let dbUser = await getUserByTelegramId(user.id);
  if (!dbUser) {
    dbUser = await createUser(user);
  }

  res.json({
    success: true,
    user: dbUser,
  });
}

module.exports = { authHandler };
