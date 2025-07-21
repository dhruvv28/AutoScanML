import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./swajyot.jpeg";

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );
}

function SuccessCheck() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="flex flex-col items-center">
        <svg className="h-20 w-20 text-green-500 animate-bounceIn" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-2xl text-green-600 font-bold mt-4 animate-fadeIn">Login Successful!</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberedUsers, setRememberedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("rememberedUsers") || "[]");
    setRememberedUsers(users);
    if (users.length > 0) {
      setUsername(users[0].username);
      setPassword(users[0].password);
      setRememberMe(true);
    }
  }, []);

  // When selecting a user from dropdown
  const handleUserSelect = (e) => {
    const selected = e.target.value;
    setUsername(selected);
    const user = rememberedUsers.find(u => u.username === selected);
    setPassword(user ? user.password : "");
    setRememberMe(!!user);
  };

  // When typing in username field, clear password if not a remembered user
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    const user = rememberedUsers.find(u => u.username === val);
    if (user) {
      setPassword(user.password);
      setRememberMe(true);
    } else {
      setPassword("");
      setRememberMe(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Login successful!");
        let users = JSON.parse(localStorage.getItem("rememberedUsers") || "[]");
        if (rememberMe) {
          // Add or update the remembered user
          users = users.filter(u => u.username !== username);
          users.unshift({ username, password });
          localStorage.setItem("rememberedUsers", JSON.stringify(users));
        }
        setRememberedUsers(users);
        localStorage.setItem("username", username);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate("/dashboard");
        }, 1200);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  return (
    <div className={`flex h-screen transition-opacity duration-500 ${success ? 'opacity-0' : 'opacity-100'}`}>
      {/* Left panel */}
      <div className="w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80')" }}>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 p-12 text-white flex flex-col justify-center h-full">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Welcome Back</h1>
          <p className="mb-6 max-w-md text-lg text-gray-200">Empower your ML journey with AutoScanML. Upload, manage, and explore your models with ease.</p>
          <div className="flex gap-4 text-2xl mt-8">
            <i className="fab fa-facebook-f hover:scale-110 transition-transform cursor-pointer"></i>
            <i className="fab fa-twitter hover:scale-110 transition-transform cursor-pointer"></i>
            <i className="fab fa-instagram hover:scale-110 transition-transform cursor-pointer"></i>
            <i className="fab fa-linkedin-in hover:scale-110 transition-transform cursor-pointer"></i>
          </div>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="w-1/2 flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-white to-blue-100 opacity-60 z-0"></div>
        <div className="w-full max-w-md space-y-6 px-8 py-10 rounded-2xl shadow-2xl bg-white/70 backdrop-blur-md z-10 relative animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-4">
            <img src={logo} alt="Swajyot Logo" className="w-16 h-16 mb-2 rounded-full shadow-lg" />
            <h2 className="text-3xl font-bold text-gray-800">Sign in</h2>
            <p className="text-gray-500 text-sm">Welcome back! Please login to your account.</p>
          </div>
          {/* Social login buttons */}
          <div className="flex gap-4 justify-center mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-md transition-transform hover:scale-110"><i className="fab fa-facebook-f"></i></button>
            <button className="bg-sky-400 hover:bg-sky-500 text-white rounded-full p-3 shadow-md transition-transform hover:scale-110"><i className="fab fa-twitter"></i></button>
            <button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 shadow-md transition-transform hover:scale-110"><i className="fab fa-instagram"></i></button>
          </div>
          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="mx-2 text-gray-400 text-xs">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          {/* Form fields */}
          {rememberedUsers.length > 1 && (
            <div>
              <label className="block mb-1 font-medium">Select Remembered User</label>
              <select
                className="w-full border rounded px-3 py-2 mb-2 bg-white/80"
                value={username}
                onChange={handleUserSelect}
              >
                {rememberedUsers.map((u) => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 bg-white/80"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 bg-white/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="text-xs text-blue-600 mt-1 underline hover:text-blue-800 transition"
              onClick={() => navigate('/forgot-password')}
              style={{ float: 'right' }}
            >
              Forgot Password?
            </button>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 rounded-lg shadow-lg hover:scale-105 transition-transform font-semibold text-lg flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-in-alt"></i>Sign in now
          </button>
          {message && <p className="text-center text-red-500 mt-2">{message}</p>}
          <p className="text-xs text-center text-gray-500 mt-6">
            By clicking on "Sign in now" you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="mx-auto block text-blue-600 text-xs mt-2 underline hover:text-blue-800 transition"
            type="button"
          >
            Don't have an account? Sign up
          </button>
        </div>
        {loading && <Spinner />}
        {success && <SuccessCheck />}
      </div>
    </div>
  );
}
/* Add these animations to your global CSS or Tailwind config:
.animate-bounceIn { animation: bounceIn 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-fadeIn { animation: fadeIn 0.7s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
*/
