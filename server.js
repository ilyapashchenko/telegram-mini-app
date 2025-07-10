const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// МАРШРУТ ДЛЯ ВЫБОРА ДОСТУПНОГО СЛОТА
const bookingRoutes = require('./routes/bookingRoutes');
app.use(bookingRoutes);

// МАРШРУТ ДЛЯ ЗАПИСИ
const bookingRoutes = require('./routes/bookingRoutes');
app.use(bookingRoutes);

// Подключаем все роуты
app.use('/', authRoutes);

// ✅ Healthcheck endpoint для Railway
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
