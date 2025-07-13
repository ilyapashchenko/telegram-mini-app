exports.getUserRole = async (req, res) => {
    const { initData } = req.body;

    console.log('📥 Получен запрос getUserRole с initData:', initData);

    if (!initData) {
        console.log('⛔ initData отсутствует');
        return res.json({ success: false, error: 'initData missing' });
    }

    const valid = isValid(initData, BOT_TOKEN);
    if (!valid) {
        console.log('⛔ initData невалиден');
        return res.json({ success: false, error: 'Invalid initData' });
    }

    const user = parse(initData).user;
    console.log('✅ Пользователь из initData:', user);

    try {
        const staffResult = await pool.query('SELECT * FROM staff WHERE user_id = $1', [user.id]);

        if (staffResult.rows.length > 0) {
            console.log('👔 Пользователь найден как сотрудник');
            return res.json({ success: true, role: 'staff' });
        }

        console.log('🙋 Пользователь не является сотрудником');
        return res.json({ success: true, role: 'client' });

    } catch (e) {
        console.error('❌ Ошибка при запросе к базе данных:', e);
        return res.json({ success: false, error: e.message });
    }
};

const { isValid, parse } = require('@telegram-apps/init-data-node');
const pool = require('../db/pool');
const BOT_TOKEN = process.env.BOT_TOKEN;

exports.getStaffBookings = async (req, res) => {
    const { initData } = req.body;

    if (!initData) {
        return res.json({ success: false, error: 'initData missing' });
    }

    const valid = isValid(initData, BOT_TOKEN);
    if (!valid) {
        return res.json({ success: false, error: 'Invalid initData' });
    }

    const user = parse(initData).user;

    try {
        // Получить данные сотрудника
        const staffResult = await pool.query(`
      SELECT * FROM staff WHERE user_id = $1
    `, [user.id]);

        if (staffResult.rows.length === 0) {
            return res.json({ success: false, error: 'Staff not found' });
        }

        const placeId = staffResult.rows[0].place_id;

        // Получить записи по этому месту
        const bookingsResult = await pool.query(`
      SELECT a.date, a.time, c.name AS client_name, s.name AS service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.place_id = $1
      ORDER BY a.date, a.time
    `, [placeId]);

        return res.json({ success: true, bookings: bookingsResult.rows });

    } catch (e) {
        console.error('Ошибка при получении записей сотрудника:', e);
        return res.json({ success: false, error: 'Database error' });
    }
};
