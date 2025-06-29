const express = require('express');
const bodyParser = require('body-parser');
const { isValid, parse } = require('@telegram-apps/init-data-node');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Твой Telegram Bot Token (замени на свой токен)
const BOT_TOKEN = process.env.BOT_TOKEN;

app.post('/auth', (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ success: false, error: 'initData is missing' });
  }

  const valid = isValid(initData, BOT_TOKEN);

  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid initData' });
  }

  const user = parse(initData).user;

  res.json({
    success: true,
    user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
