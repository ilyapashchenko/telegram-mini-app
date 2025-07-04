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

async function addPlaceById(req, res) {
  const { initData, placeId } = req.body;

  if (!initData || !placeId) {
    return res.status(400).json({ success: false, error: 'Missing data' });
  }

  const valid = isValid(initData, BOT_TOKEN);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid initData' });
  }

  const user = parse(initData).user;
  const userId = user.id;

  try {
    // Проверим, существует ли placeId в таблице places
    const placeCheck = await pool.query('SELECT * FROM places WHERE place_id = $1', [placeId]);

    if (placeCheck.rows.length === 0) {
      // 👇 явно устанавливаем тип и отправляем JSON
      return res.status(200).json({ success: false, error: 'Сервис с таким ID не найден' });
    }

    // Найдём первую свободную колонку place_1..place_4 у пользователя
    const userRow = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (userRow.rows.length === 0) {
      return res.status(200).json({ success: false, error: 'Пользователь не найден' });
    }

    const userPlaces = userRow.rows[0];

    // Проверка: не добавлен ли этот place уже
    for (let i = 1; i <= 4; i++) {
      if (userPlaces[`place_${i}`] === Number(placeId)) {
        return res.status(200).json({ success: false, error: 'Этот сервис уже добавлен' });
      }
    }

    let updated = false;

    for (let i = 1; i <= 4; i++) {
      if (!userPlaces[`place_${i}`]) {
        await pool.query(`UPDATE users SET place_${i} = $1 WHERE user_id = $2`, [placeId, userId]);
        updated = true;
        break;
      }
    }

    if (!updated) {
      return res.status(200).json({ success: false, error: 'У вас уже максимальное количество сервисов (4)' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('DB error при добавлении места:', error);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
}


module.exports = { authHandler, addPlaceById };
