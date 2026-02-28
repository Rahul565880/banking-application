const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getBalance, deposit, withdraw, getTransactions } = require('../controllers/bankController');

router.use(authenticateToken);

router.get('/balance', getBalance);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.get('/transactions', getTransactions);

module.exports = router;
