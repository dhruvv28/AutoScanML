import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './swajyot.jpeg';

const countries = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'Brazil', 'South Africa', 'Other'
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    country: '',
    email: '',
    login: '',
    password: '',
    agree: false,
    otherCountry: '',
  });
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCountryChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      country: value,
      otherCountry: '', // reset otherCountry if not 'Other'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) {
      alert('You must agree to the terms.');
      return;
    }
    const countryToSend = form.country === 'Other' ? form.otherCountry : form.country;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          country: countryToSend,
          email: form.email,
          username: form.login,
          password: form.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep('otp');
        alert('OTP sent to your email!');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      alert('Server error');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          otp: otp,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Account created!');
        navigate('/');
      } else {
        setOtpError(data.error || 'OTP verification failed');
      }
    } catch (err) {
      setOtpError('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-6 bg-white shadow">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Swajyot Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-blue-700 tracking-wide">Swajyot AutoScanML</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Back to Login
        </button>
      </div>
      {/* Main content */}
      <div className="flex flex-1 items-center justify-center w-full">
        {step === 'signup' ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center mt-8">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center mb-2">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-blue-600 tracking-wide mb-2">CREATE NEW ACCOUNT</h2>
              <div className="w-16 border-t-2 border-blue-300 mb-2"></div>
            </div>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border rounded px-3 py-2 mb-2" />
            <select
              name="country"
              value={form.country}
              onChange={handleCountryChange}
              className="w-full border rounded px-3 py-2 mb-2 bg-white text-gray-700"
              required
            >
              <option value="" disabled>Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {form.country === 'Other' && (
              <input
                name="otherCountry"
                value={form.otherCountry}
                onChange={handleChange}
                placeholder="Enter your country"
                className="w-full border rounded px-3 py-2 mb-2"
                required
              />
            )}
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded px-3 py-2 mb-2" />
            <input name="login" value={form.login} onChange={handleChange} placeholder="Username" className="w-full border rounded px-3 py-2 mb-2" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full border rounded px-3 py-2 mb-2" />
            <div className="flex items-center w-full mb-4">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mr-2" />
              <span className="text-xs">I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a> and <a href="#" className="text-blue-600 underline">Privacy Policy</a>.</span>
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold" disabled={loading}>{loading ? 'Processing...' : 'SIGN UP'}</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center mt-8">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center mb-2">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm-8 4a8 8 0 1116 0H4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-blue-600 tracking-wide mb-2">VERIFY OTP</h2>
              <div className="w-16 border-t-2 border-blue-300 mb-2"></div>
              <p className="text-gray-600 text-sm text-center">Enter the 4-digit OTP sent to <span className="font-semibold">{form.email}</span></p>
            </div>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter OTP"
              className="w-full border rounded px-3 py-2 mb-4 text-center tracking-widest text-lg font-mono"
              required
            />
            {otpError && (
              <div className="w-full text-red-600 text-sm mb-2 text-center">{otpError}</div>
            )}
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
        )}
      </div>
    </div>
  );
} 