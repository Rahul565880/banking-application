const { pool } = require('../config/db');

const getBalance = async (req, res) => {
  try {
    const [accounts] = await pool.query(
      'SELECT balance FROM accounts WHERE user_id = ?',
      [req.user.id]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ balance: parseFloat(accounts[0].balance) });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const depositAmount = parseFloat(amount);

    if (depositAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    if (depositAmount > 1000000) {
      return res.status(400).json({ message: 'Amount exceeds maximum limit' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [accounts] = await connection.query(
        'SELECT balance FROM accounts WHERE user_id = ? FOR UPDATE',
        [req.user.id]
      );

      const currentBalance = parseFloat(accounts[0].balance);
      const newBalance = currentBalance + depositAmount;

      await connection.query(
        'UPDATE accounts SET balance = ? WHERE user_id = ?',
        [newBalance, req.user.id]
      );

      await connection.query(
        'INSERT INTO transactions (user_id, type, amount, balance_after) VALUES (?, ?, ?, ?)',
        [req.user.id, 'deposit', depositAmount, newBalance]
      );

      await connection.commit();

      res.json({
        message: 'Deposit successful',
        balance: newBalance,
        transaction: {
          type: 'deposit',
          amount: depositAmount,
          balance_after: newBalance
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [accounts] = await connection.query(
        'SELECT balance FROM accounts WHERE user_id = ? FOR UPDATE',
        [req.user.id]
      );

      const currentBalance = parseFloat(accounts[0].balance);

      if (withdrawAmount > currentBalance) {
        await connection.rollback();
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const newBalance = currentBalance - withdrawAmount;

      await connection.query(
        'UPDATE accounts SET balance = ? WHERE user_id = ?',
        [newBalance, req.user.id]
      );

      await connection.query(
        'INSERT INTO transactions (user_id, type, amount, balance_after) VALUES (?, ?, ?, ?)',
        [req.user.id, 'withdraw', withdrawAmount, newBalance]
      );

      await connection.commit();

      res.json({
        message: 'Withdrawal successful',
        balance: newBalance,
        transaction: {
          type: 'withdraw',
          amount: withdrawAmount,
          balance_after: newBalance
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const [transactions] = await pool.query(
      'SELECT id, type, amount, balance_after, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      balance_after: parseFloat(t.balance_after),
      created_at: t.created_at
    }));

    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBalance, deposit, withdraw, getTransactions };
