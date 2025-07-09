import React, { useRef, useState } from "react";
import logo from "./swajyot.jpeg";
import { useNavigate } from "react-router-dom";
import uploadImg from "./upload.svg";

export default function UploadModel() {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setReportUrl(data.report_url);
        setShowResult(true);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert("No file selected");
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setSelectedFile(null);
    setReportUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 dark:from-[#1a1f29] dark:to-[#1a1f29] flex flex-col items-center justify-center relative dark:text-white">
      {/* Top bar with logo/name and back button */}
      <div className="w-full flex items-center justify-between px-10 py-6 absolute top-0 left-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 dark:text-white">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Swajyot Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-blue-600 font-sans">Swajyot AutoScanML</span>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded shadow transition border border-blue-300"
        >
          ← Back to Dashboard
        </button>
      </div>
      {/* Main content */}
      <div ref={mainRef} className="flex-1 flex flex-col items-center justify-center p-8 animate-slideFadeIn">
        {!showResult ? (
          loading ? (
            <div className="flex flex-col items-center justify-center mt-32">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mb-4"></div>
              <span className="text-blue-600 dark:text-white font-semibold text-lg">Processing...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl px-16 py-12 flex flex-col items-center w-full max-w-3xl dark:text-white">
              <img src={uploadImg} alt="Upload Illustration" className="h-24 w-auto mb-4" />
              <h1 className="text-3xl font-extrabold mb-2 text-blue-700 tracking-wide text-center font-sans dark:text-white">Upload Your Model</h1>
              <p className="mb-8 text-blue-500 text-center dark:text-white">Select a machine learning model file to scan for vulnerabilities.</p>
              <div className="flex flex-col items-center mb-6 w-full dark:text-white">
                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="bg-blue-50 dark:bg-gray-900 rounded-lg p-8 mb-4 flex items-center justify-center shadow border border-blue-200 dark:border-gray-700 w-full focus:outline-none hover:bg-blue-100 dark:hover:bg-gray-700 transition cursor-pointer dark:text-white"
                  aria-label="Choose file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".h5,.pkl,.pt,.joblib,.onnx,.sav,.model,.bin,.zip,.tar,.gz,.pytorch,.keras,.pb,.tflite,.pmml,.mlmodel,.xgb,.cbm,.pkl,.pickle,.txt,.csv,.json,.xml,.yml,.yaml"
                />
                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="bg-blue-600 text-white font-bold px-8 py-2 rounded shadow hover:bg-blue-500 transition mb-2 border border-blue-300 dark:text-white"
                >
                  Choose file
                </button>
                {selectedFile && <span className="text-blue-700 dark:text-white mt-2">{selectedFile.name}</span>}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-500 transition border border-blue-300 shadow dark:text-white"
              >
                Upload
              </button>
            </form>
          )
        ) : (
          <div className="mt-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl px-8 py-10 flex flex-col items-center w-full max-w-4xl dark:text-white">
            <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center dark:text-white">Conversion Results</h2>
            <div className="flex flex-col items-center w-full dark:text-white">
              {/* File icon/image */}
              <div className="bg-blue-50 dark:bg-gray-900 rounded-lg p-6 flex items-center justify-center mb-4 border border-blue-100 dark:border-gray-700 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-6a2 2 0 00-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10" />
                </svg>
              </div>
              {/* File name */}
              <span className="text-lg font-semibold text-gray-700 dark:text-white mb-4 break-all">{selectedFile?.name}</span>
              <div className="flex items-center gap-2 mb-6 dark:text-white">
                <span className="bg-green-50 text-green-700 border border-green-400 rounded px-3 py-1 text-sm font-semibold dark:bg-green-900 dark:text-white dark:border-green-700">Done</span>
                {/* Embedded PDF viewer */}
              </div>
              {reportUrl && (
                <div className="w-full flex flex-col items-center">
                  <iframe
                    src={reportUrl}
                    title="Vulnerability Report"
                    width="100%"
                    height="600px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                </div>
              )}
              <button
                onClick={handleReset}
                className="ml-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none dark:text-white mt-4"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-white mt-2 text-center">
              The report is generated based on your uploaded model. Please download or view the report before leaving this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 