const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

const BOT_TOKEN = process.env.BOT_TOKEN;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Отдача index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Проверка initData
app.post('/verify', (req, res) => {
  const initData = req.body.initData;

  console.log('Получено initData:', initData);

  if (!initData) {
    return res.status(400).json({ status: 'error', message: 'No initData received' });
  }

  const urlParams = new URLSearchParams(initData);
  const receivedHash = urlParams.get('hash');
  urlParams.delete('hash');

  const sortedKeys = Array.from(urlParams.keys()).filter(key => key !== 'hash').sort();

const dataCheckString = sortedKeys
  .map(key => `${key}=${urlParams.get(key)}`)
  .join('\n');


  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  console.log('dataCheckString:', dataCheckString);
  console.log('Вычисленный hash:', computedHash);
  console.log('Полученный hash:', receivedHash);

  if (computedHash === receivedHash) {
    res.json({ status: 'ok', message: 'User verified' });
  } else {
    res.status(401).json({ status: 'error', message: 'Invalid initData' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
