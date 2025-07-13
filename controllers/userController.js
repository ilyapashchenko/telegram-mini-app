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
