// controllers/bookingController.js
// КОНСТАНТЫ
const pool = require('../db/pool');
const { isValid, parse } = require('@telegram-apps/init-data-node');
const BOT_TOKEN = process.env.BOT_TOKEN;





async function getFreeSlots(req, res) {
    console.log('🔧 Запрос на /getFreeSlots', req.body);

    const { masterId, date, duration } = req.body;

    if (!masterId || !date || !duration) {
        return res.status(400).json({ success: false, error: 'Missing data' });
    }

    try {
        // 1. Время работы мастера (можно захардкодить для MVP)
        const startTime = 10 * 60; // 10:00 в минутах
        const endTime = 20 * 60; // 20:00

        // 2. Загружаем все записи у мастера на этот день
        const result = await pool.query(`
      SELECT time, duration FROM appointments
      WHERE master_id = $1 AND date = $2
    `, [masterId, date]);

        const busySlots = result.rows.map(row => {
            const [hours, minutes] = row.time.split(':').map(Number);
            const start = hours * 60 + minutes;
            const end = start + row.duration;
            return { start, end };
        });

        // 3. Ищем свободные интервалы
        const freeSlots = [];
        for (let time = startTime; time + duration <= endTime; time += 15) {
            const overlaps = busySlots.some(slot =>
                time < slot.end && (time + duration) > slot.start
            );
            if (!overlaps) {
                const hours = Math.floor(time / 60).toString().padStart(2, '0');
                const minutes = (time % 60).toString().padStart(2, '0');
                freeSlots.push(`${hours}:${minutes}`);
            }
        }

        res.json({ success: true, slots: freeSlots });
    } catch (error) {
        console.error('Ошибка при получении слотов:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
}

function extractTelegramUserId(initData) {
    const valid = isValid(initData, BOT_TOKEN);
    if (!valid) {
        throw new Error('Невалидный initData');
    }
    const user = parse(initData).user;
    return user.id;
}


// СЕРВЕРНАЯ РУЧКА ДЛЯ ЗАПИСИ

async function createBooking(req, res) {
    console.log('📥 Получен запрос на создание записи');

    try {
        const { initData, masterId, date, time, services } = req.body;

        console.log('🔍 Данные запроса:', { masterId, date, time, services });

        if (!initData || !masterId || !date || !time || !services || services.length === 0) {
            return res.status(400).json({ success: false, error: 'Некорректные данные' });
        }

        // 🔐 Проверка initData
        const valid = isValid(initData, BOT_TOKEN);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Невалидный initData' });
        }

        const user = parse(initData).user;
        const clientId = user.id;

        // 🔎 Получаем place_id по masterId
        const placeResult = await pool.query(
            `SELECT place_id FROM masters WHERE master_id = $1`,
            [masterId]
        );

        if (placeResult.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Мастер не найден' });
        }

        const placeId = placeResult.rows[0].place_id;

        const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

        // ✅ Добавляем запись и получаем appointment_id
        const insertAppointment = await pool.query(
            `INSERT INTO appointments (master_id, place_id, date, time, duration, client_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING appointment_id`,
            [masterId, placeId, date, time, totalDuration, clientId]
        );

        const appointmentId = insertAppointment.rows[0].appointment_id;

        // 🔁 Вставляем связи в appointment_services
        for (const service of services) {
            await pool.query(
                `INSERT INTO appointment_services (appointment_id, service_id)
                 VALUES ($1, $2)`,
                [appointmentId, service.id]
            );
        }

        res.json({ success: true });

    } catch (error) {
        console.error('❌ Ошибка при создании записи:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}















// ПОДГРУЗКА ЗАПИСЕЙ ВО ВТОРОМ ОКНЕ
async function getUserBookings(req, res) {
    const { initData } = req.body;

    if (!initData) {
        return res.status(400).json({ success: false, error: 'initData is required' });
    }

    try {
        const tgUserId = extractTelegramUserId(initData);

        const result = await pool.query(`
  SELECT 
  a.date, 
  a.time, 
  a.client_name, 
  s.name AS service_name
FROM appointments a
JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
JOIN services s ON s.service_id = aps.service_id
WHERE a.place_id = $1
ORDER BY a.date, a.time;

`, [tgUserId]);


        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error('Ошибка при получении записей:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}







module.exports = { getFreeSlots, createBooking, getUserBookings };
