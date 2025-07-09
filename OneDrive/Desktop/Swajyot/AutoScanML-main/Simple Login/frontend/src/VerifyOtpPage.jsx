import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const response = await fetch('http://localhost:5000/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
      credentials: 'include'
    });
    const data = await response.json();
    if (response.ok) {
      setSuccess('Account created! You can now log in.');
      setTimeout(() => navigate('/'), 2000);
    } else {
      setError(data.error || 'Verification failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="w-full border rounded px-3 py-2 mb-2"
      />
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      {success && <div className="text-xs text-green-600 mb-2">{success}</div>}
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold">
        Verify OTP
      </button>
    </form>
  );
}