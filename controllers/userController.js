exports.getUserRole = async (req, res) => {
    const { initData } = req.body;
    if (!initData) return res.json({ success: false, error: 'initData missing' });

    try {
        const user = parseInitDataAndGetUser(initData);

        const staffResult = await pool.query('SELECT * FROM staff WHERE user_id = $1', [user.id]);
        if (staffResult.rows.length > 0) {
            return res.json({ success: true, role: 'staff' });
        }

        return res.json({ success: true, role: 'client' });

    } catch (e) {
        return res.json({ success: false, error: e.message });
    }
};
