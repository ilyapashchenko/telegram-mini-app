const { parseInitDataAndGetUser } = require('../utils/parseInitData'); // если он где-то импортируется
const pool = require('../db'); // если используется отдельный модуль подключения к БД

exports.getUserRole = async (req, res) => {
    const { initData } = req.body;
    console.log('🔵 [getUserRole] Запрос получен');
    console.log('📦 initData:', initData);

    if (!initData) {
        console.warn('❌ initData не передан');
        return res.json({ success: false, error: 'initData missing' });
    }

    try {
        const user = parseInitDataAndGetUser(initData);
        console.log('✅ Пользователь успешно извлечён из initData:', user);

        const staffResult = await pool.query(
            'SELECT * FROM staff WHERE user_id = $1',
            [user.id]
        );

        console.log('📊 Результат запроса в staff:', staffResult.rows);

        if (staffResult.rows.length > 0) {
            console.log('🧑‍💼 Пользователь найден как staff');
            return res.json({ success: true, role: 'staff' });
        }

        console.log('👤 Пользователь не является staff, назначаем как client');
        return res.json({ success: true, role: 'client' });

    } catch (e) {
        console.error('💥 Ошибка в getUserRole:', e);
        return res.json({ success: false, error: e.message });
    }
};

