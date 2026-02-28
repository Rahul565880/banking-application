const express = require('express');
const router = express.Router();
const { register, login, logout, checkAuth } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-auth', authenticateToken, checkAuth);

module.exports = router;
