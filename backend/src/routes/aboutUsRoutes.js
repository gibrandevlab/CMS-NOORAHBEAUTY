const express = require('express');
const router = express.Router();
const aboutUsController = require('../controllers/aboutUsController');

router.get('/', aboutUsController.get);
router.put('/', aboutUsController.update);

module.exports = router;
