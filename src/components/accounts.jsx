import React, { useState } from "react";

function Accounts() {
  const [profile, setProfile] = useState({
    username: "crypto_trader",
    email: "trader@example.com",
    displayName: "Crypto Trader",
    bio: "Passionate about cryptocurrency trading",
  });

  const [preferences, setPreferences] = useState({
    currency: "USD",
    theme: "dark",
    notifications: true,
    twoFactorAuth: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const handleProfileChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const saveProfile = () => {
    setProfile({ ...editForm });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const cancelEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  return (
    <div className="accounts">
      <h1>Account Settings</h1>

      <div className="accounts-grid">
        {/* Profile Section */}
        <div className="account-section profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={saveProfile}>
                  Save
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
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <p className="username">@{profile.username}</p>
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
                  <label htmlFor="email">Email</label>
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
                    rows="3"
                    value={editForm.bio}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profile.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bio:</span>
                  <span className="detail-value">{profile.bio}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="account-section preferences-section">
          <h2>Preferences</h2>

          <div className="preferences-list">
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Currency</span>
                <span className="preference-description">
                  Select your preferred currency
                </span>
              </div>
              <select
                name="currency"
                value={preferences.currency}
                onChange={handlePreferenceChange}
                className="preference-select"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Theme</span>
                <span className="preference-description">
                  Choose your interface theme
                </span>
              </div>
              <select
                name="theme"
                value={preferences.theme}
                onChange={handlePreferenceChange}
                className="preference-select"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Notifications</span>
                <span className="preference-description">
                  Receive trading alerts and updates
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={preferences.notifications}
                  onChange={handlePreferenceChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-label">Two-Factor Authentication</span>
                <span className="preference-description">
                  Add an extra layer of security
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={preferences.twoFactorAuth}
                  onChange={handlePreferenceChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="account-section security-section">
          <h2>Security</h2>

          <div className="security-options">
            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Change Password</span>
                <span className="security-description">
                  Update your password regularly
                </span>
              </div>
              <button className="security-btn">Change</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">Session Management</span>
                <span className="security-description">
                  View and manage active sessions
                </span>
              </div>
              <button className="security-btn">Manage</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <span className="security-label">API Keys</span>
                <span className="security-description">
                  Manage your API access keys
                </span>
              </div>
              <button className="security-btn">View</button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="account-section danger-section">
          <h2>Danger Zone</h2>
          <p className="danger-description">
            Irreversible actions related to your account
          </p>

          <div className="danger-options">
            <button className="danger-btn">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accounts;
