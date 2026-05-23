import React, { useState, useContext } from "react";
import TradeWalletContext from "../context/TradeWalletContext";

function Accounts() {
  const { userSettings, updateProfile, updatePreferences, wallet, trades } = useContext(TradeWalletContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    displayName: userSettings.displayName,
    email: userSettings.email,
    bio: userSettings.bio,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditForm({ 
      displayName: userSettings.displayName,
      email: userSettings.email,
      bio: userSettings.bio,
    });
    setIsEditing(false);
  };

  const totalTrades = trades.length;
  const closedTrades = trades.filter(t => t.status === 'CLOSED').length;
  const winRate = closedTrades > 0 
    ? ((trades.filter(t => t.status === 'CLOSED' && 
        ((t.type === 'LONG' && t.exit > t.entry) || (t.type === 'SHORT' && t.exit < t.entry))
      ).length / closedTrades) * 100).toFixed(1)
    : 0;

  return (
    <div className="accounts">
      <div className="accounts-header">
        <h1>Account Settings</h1>
        <div className="account-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="account-section profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={saveProfile}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-content">
            <div className="avatar-container">
              <div className="avatar">
                {userSettings.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <p className="username">@{userSettings.username}</p>
                <p className="member-since">Member since 2024</p>
              </div>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={editForm.displayName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={editForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Display Name:</span>
                  <span className="detail-value">{userSettings.displayName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{userSettings.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bio:</span>
                  <span className="detail-value">{userSettings.bio || 'No bio set'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="account-section preferences-section">
          <h2>Preferences</h2>

          <div className="preferences-list">
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Display Currency</span>
                <span className="preference-description">
                  Select your preferred currency for displaying prices
                </span>
              </div>
              <select
                name="currency"
                value={userSettings.currency}
                onChange={(e) => updatePreferences({ currency: e.target.value })}
                className="preference-select"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="KRW">KRW (₩)</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Interface Theme</span>
                <span className="preference-description">
                  Choose between dark and light mode
                </span>
              </div>
              <select
                name="theme"
                value={userSettings.theme}
                onChange={(e) => updatePreferences({ theme: e.target.value })}
                className="preference-select"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Price Notifications</span>
                <span className="preference-description">
                  Receive alerts for significant price movements
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={userSettings.notifications}
                  onChange={(e) => updatePreferences({ notifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Email Updates</span>
                <span className="preference-description">
                  Receive weekly portfolio summaries and market insights
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="emailUpdates"
                  defaultChecked={true}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Default Trade Size</span>
                <span className="preference-description">
                  Set default amount for quick trades
                </span>
              </div>
              <select className="preference-select">
                <option>$100</option>
                <option>$500</option>
                <option>$1,000</option>
                <option>$5,000</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="account-section security-section">
          <h2>Security Settings</h2>

          <div className="security-options">
            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Two-Factor Authentication</span>
                <span className="security-description">
                  Add an extra layer of security to your account
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={userSettings.twoFactorAuth}
                  onChange={(e) => updatePreferences({ twoFactorAuth: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Change Password</span>
                <span className="security-description">
                  Update your password regularly for better security
                </span>
              </div>
              <button className="security-btn">Change</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Active Sessions</span>
                <span className="security-description">
                  View and manage devices logged into your account
                </span>
              </div>
              <button className="security-btn">Manage</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">API Keys</span>
                <span className="security-description">
                  Manage API access keys for third-party integrations
                </span>
              </div>
              <button className="security-btn">View Keys</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Login History</span>
                <span className="security-description">
                  Review recent login activity on your account
                </span>
              </div>
              <button className="security-btn">View History</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Withdrawal Whitelist</span>
                <span className="security-description">
                  Restrict withdrawals to pre-approved addresses only
                </span>
              </div>
              <button className="security-btn">Configure</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="account-section stats-section">
          <h2>Trading Statistics</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-label">Total Balance</span>
                <span className="stat-value">${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-label">Total Trades</span>
                <span className="stat-value">{totalTrades}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-label">Closed Trades</span>
                <span className="stat-value">{closedTrades}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">{winRate}%</span>
              </div>
            </div>
          </div>

          <div className="holdings-section">
            <h3>Current Holdings</h3>
            {Object.keys(wallet.holdings).length === 0 ? (
              <p className="no-holdings">No cryptocurrency holdings yet. Start trading to build your portfolio!</p>
            ) : (
              <div className="holdings-list">
                {Object.entries(wallet.holdings).map(([symbol, amount]) => (
                  <div key={symbol} className="holding-item">
                    <span className="holding-symbol">{symbol}</span>
                    <span className="holding-amount">{amount.toFixed(6)} {symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="account-section danger-section">
        <h2>Danger Zone</h2>
        <p className="danger-description">
          Irreversible actions related to your account. Please be careful.
        </p>

        <div className="danger-options">
          {showDeleteConfirm ? (
            <div className="delete-confirm">
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="confirm-delete-btn">Yes, Delete Account</button>
                <button className="cancel-delete-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button className="danger-btn" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </button>
              <button className="danger-btn secondary" onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}>
                Clear All Data
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Accounts;
