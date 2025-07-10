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



// СЕРВЕРНАЯ РУЧКА ДЛЯ ЗАПИСИ
async function createBooking(req, res) {
    try {
        const { masterId, date, time, services } = req.body;

        if (!masterId || !date || !time || !services || services.length === 0) {
            return res.status(400).json({ success: false, error: 'Некорректные данные' });
        }

        // 🔍 Получаем place_id по masterId
        const placeResult = await pool.query(
            `SELECT place_id FROM masters WHERE master_id = $1`,
            [masterId]
        );

        if (placeResult.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Мастер не найден' });
        }

        const placeId = placeResult.rows[0].place_id;

        const [hours, minutes] = time.split(':').map(Number);
        const startTime = hours * 60 + minutes;
        const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

        // ✅ Добавляем запись
        await pool.query(
            `INSERT INTO appointments (master_id, place_id, date, time, duration)
       VALUES ($1, $2, $3, $4, $5)`,
            [masterId, placeId, date, time, totalDuration]
        );

        res.json({ success: true });

    } catch (error) {
        console.error('❌ Ошибка при создании записи:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}



module.exports = { getFreeSlots, createBooking };
