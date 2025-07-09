import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './swajyot.jpeg';
import { useTheme } from "./ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const mainRef = useRef();
  function handleBack() {
    if (mainRef.current) {
      mainRef.current.classList.remove('animate-slideFadeIn');
      mainRef.current.classList.add('animate-slideFadeOut');
      setTimeout(() => navigate('/dashboard'), 700);
    } else {
      navigate('/dashboard');
    }
  }
  const [email, setEmail] = useState("user@example.com");
  const [name, setName] = useState("Dhruv");
  const { theme, setTheme } = useTheme();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const username = localStorage.getItem("username") || "";
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      fetch(`http://localhost:5000/api/users?username=${username}`)
        .then(res => res.json())
        .then(data => {
          // If your API returns a list, find the user by username
          const userData = Array.isArray(data)
            ? data.find(u => u.username === username)
            : data;
          if (userData) setUser({ name: userData.name, email: userData.email });
        });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    alert("Settings saved!");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setShowChangePassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.error || 'Failed to update password.');
      }
    } catch {
      setPasswordMessage('Server error.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#1a1f29] text-gray-900 dark:text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Swajyot Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-blue-700 tracking-wide">Swajyot AutoScanML</span>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
      {/* Main content */}
      <main ref={mainRef} className="flex-1 flex flex-col items-center justify-center p-6 animate-slideFadeIn">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Account Info</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={user.name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                readOnly
              />
              <input
                type="email"
                value={user.email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                readOnly
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Preferences</h2>
            <label className="block mb-2">Theme:</label>
            <select
              className="border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Security Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Security</h2>
            {!showChangePassword ? (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
                <input
                  type="password"
                  placeholder="Existing password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
                {passwordMessage && (
                  <div className="text-xs text-red-600">{passwordMessage}</div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => {
                      setShowChangePassword(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordMessage('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
          >
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
} 