// controllers/bookingController.js

const pool = require('../db/pool');

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
    const validation = validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
    if (!validation.ok) {
        throw new Error('Invalid initData');
    }
    return validation.user.id;
}

// СЕРВЕРНАЯ РУЧКА ДЛЯ ЗАПИСИ
const { validateInitData } = require('@telegram-apps/init-data-node');


async function createBooking(req, res) {
    console.log('📥 Получен запрос на создание записи');
    try {
        const { initData, masterId, date, time, services } = req.body;
        console.log('🔍 Данные запроса:', { masterId, date, time, services });

        if (!initData) {
            console.log('❌ initData не передан');
            return res.status(400).json({ success: false, error: 'initData не передан' });
        }

        const validation = validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
        if (!validation.ok) {
            console.log('❌ Невалидный initData:', validation);
            return res.status(400).json({ success: false, error: 'Невалидный initData' });
        }

        if (!masterId || !date || !time || !services || services.length === 0) {
            console.log('❌ Некорректные данные:', { masterId, date, time, services });
            return res.status(400).json({ success: false, error: 'Некорректные данные' });
        }

        const placeResult = await pool.query(
            `SELECT place_id FROM masters WHERE master_id = $1`,
            [masterId]
        );

        if (placeResult.rows.length === 0) {
            console.log('❌ Мастер не найден с id:', masterId);
            return res.status(400).json({ success: false, error: 'Мастер не найден' });
        }

        const placeId = placeResult.rows[0].place_id;
        const clientId = validation.user.id;
        const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

        console.log('📌 Запись в appointments:', {
            masterId, placeId, date, time, totalDuration, clientId
        });

        const insertResult = await pool.query(
            `INSERT INTO appointments (master_id, place_id, date, time, duration, client_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [masterId, placeId, date, time, totalDuration, clientId]
        );

        const appointmentId = insertResult.rows[0].id;
        console.log('✅ Запись добавлена, appointment_id:', appointmentId);

        for (const service of services) {
            console.log('🛠 Добавляем услугу в appointment_services:', {
                appointmentId,
                serviceId: service.id
            });

            await pool.query(
                `INSERT INTO appointment_services (appointment_id, service_id)
         VALUES ($1, $2)`,
                [appointmentId, service.id]
            );
        }

        console.log('🎉 Все услуги добавлены. Запись завершена.');
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
      SELECT a.date, a.time, a.duration, m.name AS master_name, s.name AS service_name
      FROM appointments a
      JOIN masters m ON a.master_id = m.master_id
      JOIN appointment_services aps ON aps.appointment_id = a.id
      JOIN services s ON aps.service_id = s.service_id
      WHERE a.client_id = $1
      ORDER BY a.date, a.time
    `, [tgUserId]);

        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error('Ошибка при получении записей:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}







module.exports = { getFreeSlots, createBooking, getUserBookings };
