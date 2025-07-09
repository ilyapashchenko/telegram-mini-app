const pool = require('../db/pool');

async function getMastersByPlace(req, res) {
    const { placeId } = req.body;

    if (!placeId) {
        return res.status(400).json({ success: false, error: 'placeId is required' });
    }

    try {
        const result = await pool.query(
            'SELECT master_id, name FROM masters WHERE place_id = $1',
            [placeId]
        );

        res.json({ success: true, masters: result.rows });
    } catch (error) {
        console.error('Ошибка при получении мастеров:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
}

module.exports = {
    getMastersByPlace
};
