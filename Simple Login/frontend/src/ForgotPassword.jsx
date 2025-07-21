import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./swajyot.jpeg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp+new password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/forgot-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "If the email exists, an OTP has been sent.");
        setStep(2);
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/forgot-password-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Password has been reset successfully!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
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
        <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center mt-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-500 rounded-full h-20 w-20 flex items-center justify-center mb-2">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-600 tracking-wide mb-2">FORGOT PASSWORD</h2>
            <div className="w-16 border-t-2 border-blue-300 mb-2"></div>
          </div>
          {step === 1 && (
            <>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 mb-4"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
            </>
          )}
          {step === 2 && (
            <>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 mb-4"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                placeholder="Enter the OTP sent to your email"
                disabled={loading}
              />
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-4"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password"
                disabled={loading}
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
            </>
          )}
          {error && <p className="text-center text-red-600 mt-4">{error}</p>}
          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
        </form>
      </div>
    </div>
  );
} 