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

// ✅ Подключение к базе данных PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Railway требует SSL
  },
});

// ✅ Проверка подключения к базе
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err);
    process.exit(1); // Добавь принудительный выход, если база не подключилась
  });

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
