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
  const userId = user.id;

  try {
    // Проверяем, есть ли пользователь в таблице users
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (rows.length === 0) {
      // Если пользователя нет — создаём новую запись с пустыми местами
      await pool.query(
        `INSERT INTO users (user_id, place_1, place_2, place_3, place_4) VALUES ($1, NULL, NULL, NULL, NULL)`,
        [userId]
      );
      
      return res.json({
        success: true,
        user,
        places: [], // Пустой список мест, т.к. пользователь новый
      });
    } else {
      // Если пользователь есть — возвращаем его места (place_1..place_4)
      const userPlaces = rows[0];

      // Соберём массив не-null мест
      const placesIds = [];
      for (let i = 1; i <= 4; i++) {
        const place = userPlaces[`place_${i}`];
        if (place) placesIds.push(place);
      }

      // Можно дополнительно получить из таблицы places подробности по этим place_id
      // Например:
      let placesDetails = [];
      if (placesIds.length > 0) {
        const resPlaces = await pool.query(
          `SELECT * FROM places WHERE place_id = ANY($1)`,
          [placesIds]
        );
        placesDetails = resPlaces.rows;
      }

      return res.json({
        success: true,
        user,
        places: placesDetails, // Возвращаем детали мест
      });
    }
  } catch (error) {
    console.error('DB error:', error);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
}

module.exports = { authHandler };
