// Simple Login/frontend/src/ScannedReports.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./swajyot.jpeg"; // Make sure your logo is in src/ as logo.svg

export default function ScannedReports() {
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/uploads")
      .then((res) => res.json())
      .then((data) => {
        setReports(
          data.map((r) => ({
            name: r.filename,
            date: r.upload_date.slice(0, 10),
            file: r.report_url, // Update this if you have per-file reports
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        setReports([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-[#1a1f29] dark:to-[#1a1f29] flex flex-col items-center dark:text-white">
      {/* Header with logo and back button */}
      <div className="w-full flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow dark:text-white">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Swajyot Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-blue-700 tracking-wide">Swajyot AutoScanML</span>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main content card */}
      <div ref={mainRef} className="w-full max-w-4xl mt-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 dark:text-white animate-slideFadeIn">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Scanned Reports</h1>
        <table className="w-full table-auto rounded-lg overflow-hidden shadow dark:text-white">
          <thead>
            <tr className="bg-blue-100 dark:bg-gray-700 text-gray-700 dark:text-white">
              <th className="p-3 text-left dark:text-white">Report Name</th>
              <th className="p-3 text-left dark:text-white">Date</th>
              <th className="p-3 text-left dark:text-white">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-400 dark:text-white">
                  Loading...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-400 dark:text-white">
                  No reports found.
                </td>
              </tr>
            ) : (
              reports.map((r, i) => (
                <tr key={i} className="border-b hover:bg-blue-50 dark:hover:bg-gray-900 transition dark:text-white">
                  <td className="p-3 font-medium dark:text-white">{r.name}</td>
                  <td className="p-3 dark:text-white">{r.date}</td>
                  <td className="p-3 dark:text-white">
                    <a
                      href={r.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition dark:text-white"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}