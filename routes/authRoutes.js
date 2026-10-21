const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Public route: Register a new user
router.post('/register', register);

// Public route: Login user and return JWT
router.post('/login', login);

module.exports = router;
