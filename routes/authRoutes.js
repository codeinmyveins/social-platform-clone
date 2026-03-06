const express = require('express');
const router = express.Router();

// Import the auth controller
const {register, login, logout} = require('../controllers/authContoller.js');

// Define routes for authentication
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;