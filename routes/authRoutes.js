const express = require('express');
const { authHandler } = require('../controllers/authController');

const router = express.Router();

router.post('/auth', authHandler);

module.exports = router;
