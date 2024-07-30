const express = require('express')
const authConttroller = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authConttroller.signup);
router.post('/login', authConttroller.login);

module.exports = router;