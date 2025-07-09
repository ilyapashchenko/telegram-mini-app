const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const masterController = require('../controllers/masterController');


router.post('/auth', authController.authHandler);
router.post('/addPlaceById', authController.addPlaceById);
router.post('/deletePlace', authController.deletePlace);
router.post('/getMastersByPlace', masterController.getMastersByPlace);
router.post('/getServicesByPlace', masterController.getServicesByPlace);


module.exports = router;





















// const express = require('express');
// const { authHandler, addPlaceById } = require('../controllers/authController');

// const router = express.Router();

// router.post('/auth', authHandler);
// router.post('/addPlaceById', addPlaceById);



// module.exports = router;
