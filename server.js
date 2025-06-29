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

// Подключаем все роуты
app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
