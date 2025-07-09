import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ["#ff4d4f", "#ffa940", "#ffec3d", "#52c41a"];
const SEVERITY_LABELS = ["Critical", "High", "Medium", "Low"];

export default function Dashboard() {
  const [models, setModels] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [highRiskModels, setHighRiskModels] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/models")
      .then(res => res.json())
      .then(setModels);

    fetch("http://localhost:5000/api/vulnerabilities")
      .then(res => res.json())
      .then(setVulnerabilities);

    fetch("http://localhost:5000/api/high-risk-models")
      .then(res => res.json())
      .then(setHighRiskModels);
  }, []);

  // Dashboard stats
  const modelsScanned = models.length;
  const vulnerabilitiesFound = vulnerabilities.length;
  const highRiskModelsCount = highRiskModels.length;
  const lastScan = models.length > 0 ? new Date(models[0].upload_date).toLocaleDateString() : "N/A";

  // Severity breakdown for pie chart
  const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  vulnerabilities.forEach(v => {
    const sev = (v.severity || '').toLowerCase();
    if (sev === 'critical') severityCounts.Critical++;
    else if (sev === 'high') severityCounts.High++;
    else if (sev === 'medium') severityCounts.Medium++;
    else severityCounts.Low++;
  });
  const severityData = SEVERITY_LABELS.map((label, i) => ({ name: label, value: severityCounts[label] }));

  // Vulnerability types for bar chart
  const typeCounts = {};
  vulnerabilities.forEach(v => {
    const t = v.type || 'Unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const typeData = Object.keys(typeCounts).map(type => ({ type, value: typeCounts[type] }));

  // Recent scans (most recent first)
  const recentScans = models.slice(0, 5);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#1a1f29]">
      <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col justify-between h-full">
        <div>
          <h2 className="text-2xl font-bold mb-6">AutoScanML</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/upload-model" className="hover:bg-gray-800 px-3 py-2 rounded">Upload Model</Link>
            <Link to="/scanned-reports" className="hover:bg-gray-800 px-3 py-2 rounded">Scanned Reports</Link>
            <Link to="/vulnerability-trends" className="hover:bg-gray-800 px-3 py-2 rounded">Vulnerability Trends</Link>
            <Link to="/settings" className="hover:bg-gray-800 px-3 py-2 rounded">Settings</Link>
          </nav>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition font-semibold shadow"
        >
          Logout
        </button>
      </aside>
      <div className="flex-1 p-8 overflow-y-auto bg-gray-100 dark:bg-[#181c23]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Dashboard Overview</h1>
          <Link to="/upload-model">
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">+ Upload Model</button>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 dark:text-gray-300">Models Scanned</span>
            <span className="text-3xl font-bold mt-2 dark:text-white">{modelsScanned}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 dark:text-gray-300">Vulnerabilities Found</span>
            <span className="text-3xl font-bold mt-2 text-red-500 dark:text-white">{vulnerabilitiesFound}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 dark:text-gray-300">High Risk Models</span>
            <span className="text-3xl font-bold mt-2 text-orange-500 dark:text-white">{highRiskModelsCount}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6 flex flex-col items-center">
            <span className="text-gray-500 dark:text-gray-300">Last Scan</span>
            <span className="text-2xl font-bold mt-2 dark:text-white">{lastScan}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
            <h2 className="font-semibold mb-4 dark:text-white">Vulnerability Severity</h2>
            {vulnerabilities.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500">No vulnerability data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-4 justify-center">
              {SEVERITY_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }}></span>
                  <span className="text-xs dark:text-gray-200">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
            <h2 className="font-semibold mb-4 dark:text-white">Vulnerability Types</h2>
            {vulnerabilities.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500">No vulnerability data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#69b3f9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h2 className="font-semibold mb-4 dark:text-white">Recent Scans</h2>
          <table className="w-full text-sm dark:text-white">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 text-left">Model</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Risk</th>
                <th className="py-2 px-4 text-left">Issues</th>
                <th className="py-2 px-4 text-left">Report</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map(model => (
                <tr key={model.id}>
                  <td className="py-2 px-4">{model.filename}</td>
                  <td className="py-2 px-4">{model.upload_date ? model.upload_date.slice(0, 10) : ""}</td>
                  <td className="py-2 px-4">
                    {model.high_risk ? <span className="text-orange-500 font-semibold">High</span> : <span className="text-green-600 font-semibold">Low</span>}
                  </td>
                  <td className="py-2 px-4">{model.vulnerabilities ? model.vulnerabilities.length : "-"}</td>
                  <td className="py-2 px-4">
                    {model.report_path && (
                      <a href={`http://localhost:5000/uploads/${model.report_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
