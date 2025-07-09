import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ScannedReports from "./ScannedReports";
import UploadModel from './UploadModel';
import VulnerabilityTrends from './VulnerabilityTrends';
import Settings from './Settings';
import SignupPage from './SignupPage';
import { ThemeProvider } from "./ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-blue-100 dark:bg-gray-900">
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scanned-reports" element={<ScannedReports />} />
        <Route path="/upload-model" element={<UploadModel />} />
        <Route path="/vulnerability-trends" element={<VulnerabilityTrends />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
