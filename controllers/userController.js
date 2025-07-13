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
    console.log('📥 /api/getStaffBookings вызван');
    const { initData } = req.body;

    if (!initData) {
        console.log('❌ initData отсутствует в теле запроса');
        return res.json({ success: false, error: 'initData missing' });
    }

    console.log('🔍 Проверка валидности initData...');
    const valid = isValid(initData, BOT_TOKEN);
    if (!valid) {
        console.log('❌ initData невалиден');
        return res.json({ success: false, error: 'Invalid initData' });
    }

    let user;
    try {
        user = parse(initData).user;
        console.log('✅ Пользователь распарсен:', user);
    } catch (e) {
        console.log('❌ Ошибка парсинга initData:', e);
        return res.json({ success: false, error: 'Parse initData error' });
    }

    try {
        console.log(`🔍 Поиск сотрудника с user_id = ${user.id} в таблице staff...`);
        const staffResult = await pool.query(`
      SELECT * FROM staff WHERE user_id = $1
    `, [user.id]);

        if (staffResult.rows.length === 0) {
            console.log('❌ Сотрудник не найден в таблице staff');
            return res.json({ success: false, error: 'Staff not found' });
        }

        const placeId = staffResult.rows[0].place_id;
        console.log(`✅ Найден сотрудник. place_id = ${placeId}`);

        console.log(`🔍 Получение записей для place_id = ${placeId}...`);
        const bookingsResult = await pool.query(`
      SELECT
        a.appointment_id,
        a.date,
        a.time,
        a.client_name,
        STRING_AGG(s.name, ', ') AS services_names
      FROM appointments a
      LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
      LEFT JOIN services s ON aps.service_id = s.service_id
      WHERE a.place_id = $1
      GROUP BY a.appointment_id
      ORDER BY a.date, a.time
    `, [placeId]);

        console.log(`✅ Найдено записей: ${bookingsResult.rows.length}`);
        // Можно еще вывести сами записи, если не очень много:
        console.log('Записи:', bookingsResult.rows);

        return res.json({ success: true, bookings: bookingsResult.rows });

    } catch (e) {
        console.error('🔥 Ошибка при получении записей сотрудника:', e.message, '\n', e.stack);
        return res.json({ success: false, error: e.message });
    }

};


