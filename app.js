const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Token из переменной среды
const BOT_TOKEN = process.env.BOT_TOKEN;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Основной маршрут отдаёт index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для верификации initData из Telegram
app.post('/verify', (req, res) => {
  const initData = req.body.initData;

  if (!initData) {
    return res.status(400).json({ status: 'error', message: 'No initData received' });
  }

  const urlParams = new URLSearchParams(initData);
  const receivedHash = urlParams.get('hash');
  urlParams.delete('hash');

  const sortedKeys = Array.from(urlParams.keys()).sort();

  const dataCheckString = sortedKeys
    .map(key => `${key}=${urlParams.get(key)}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash === receivedHash) {
    res.json({ status: 'ok', message: 'User verified' });
  } else {
    res.status(401).json({ status: 'error', message: 'Invalid initData' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
