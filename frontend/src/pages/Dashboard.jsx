import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bankAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      setLoading(false);
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    try {
      await Promise.all([fetchBalance(), fetchTransactions()]);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await bankAPI.getBalance();
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Failed to fetch balance');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await bankAPI.getTransactions();
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }
    setActionLoading(true);
    setMessage('');
    try {
      const response = await bankAPI.deposit(amount);
      setBalance(response.data.balance);
      setTransactions([response.data.transaction, ...transactions]);
      setAmount('');
      setMessage('Deposit successful!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }
    setActionLoading(true);
    setMessage('');
    try {
      const response = await bankAPI.withdraw(amount);
      setBalance(response.data.balance);
      setTransactions([response.data.transaction, ...transactions]);
      setAmount('');
      setMessage('Withdrawal successful!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout failed');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>KodBank</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'deposit' ? 'active' : ''} 
            onClick={() => setActiveTab('deposit')}
          >
            Deposit
          </button>
          <button 
            className={activeTab === 'withdraw' ? 'active' : ''} 
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''} 
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="welcome-text">
            Welcome, <strong>{user?.username}</strong>!
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="content-section">
            <div className="balance-card">
              <h3>Account Balance</h3>
              <p className="balance-amount">${balance.toFixed(2)}</p>
              <p className="account-number">Account: {user?.id}****{user?.username?.slice(-2)}</p>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={() => setActiveTab('deposit')} className="action-btn deposit">Deposit Money</button>
                <button onClick={() => setActiveTab('withdraw')} className="action-btn withdraw">Withdraw Money</button>
              </div>
            </div>

            <div className="recent-transactions">
              <h3>Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="no-transactions">No transactions yet</p>
              ) : (
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className={tx.type}>{tx.type}</td>
                        <td className={tx.type}>
                          {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                        </td>
                        <td>${parseFloat(tx.balance_after).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'deposit' && (
          <div className="content-section">
            <div className="action-card">
              <h3>Deposit Money</h3>
              <form onSubmit={handleDeposit}>
                <input
                  type="number"
                  placeholder="Enter amount to deposit"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <button type="submit" disabled={actionLoading} className="deposit-btn">
                  {actionLoading ? 'Processing...' : 'Deposit'}
                </button>
              </form>
              {message && (
                <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="content-section">
            <div className="action-card">
              <h3>Withdraw Money</h3>
              <form onSubmit={handleWithdraw}>
                <input
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  max={balance}
                />
                <button type="submit" disabled={actionLoading} className="withdraw-btn">
                  {actionLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </form>
              {message && (
                <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="content-section">
            <h3>Transaction History</h3>
            {transactions.length === 0 ? (
              <p className="no-transactions">No transactions yet</p>
            ) : (
              <table className="transactions-table full">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.created_at).toLocaleString()}</td>
                      <td className={tx.type}>{tx.type}</td>
                      <td className={tx.type}>
                        {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td>${parseFloat(tx.balance_after).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-section">
            <div className="settings-card">
              <h3>Account Settings</h3>
              <div className="setting-item">
                <label>Username</label>
                <p>{user?.username}</p>
              </div>
              <div className="setting-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="setting-item">
                <label>Account Status</label>
                <p className="status-active">Active</p>
              </div>
              <div className="setting-item">
                <label>Member Since</label>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
