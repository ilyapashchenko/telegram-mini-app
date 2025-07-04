const express = require('express');
const { authHandler, addPlaceById } = require('../controllers/authController');

const router = express.Router();

router.post('/auth', authHandler);
router.post('/addPlaceById', addPlaceById);
router.post('/deletePlace', authController.deletePlace);



module.exports = router;
