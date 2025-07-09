const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/getFreeSlots', bookingController.getFreeSlots);

module.exports = router;
