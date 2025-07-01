const express = require('express');
const { authHandler, addPlaceById } = require('../controllers/authController');

const router = express.Router();

router.post('/auth', authHandler);
router.post('/addPlaceById', addPlaceById);

module.exports = router;
