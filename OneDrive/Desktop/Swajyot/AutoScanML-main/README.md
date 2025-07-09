
# AutoScanML: Automated ML Model Vulnerability Scanner

AutoScanML is a cybersecurity and machine learning tool designed to automatically detect vulnerabilities in trained ML/AI models before deployment. This tool helps data science and AI teams secure their model pipelines by scanning saved model files (e.g., `.pkl`, `.h5`, `.onnx`) and generating vulnerability reports.

## 🔍 What It Does

- Scans machine learning models for:
  - Adversarial input risks
  - Insecure serialization (e.g., pickle exploits)
  - Model theft vulnerabilities
  - Missing input/output sanitization
  - Overexposed or unsecured prediction APIs
- Uses rule-based and ML-assisted scanning strategies
- Outputs detailed, readable vulnerability reports

## 💡 Why It Matters

Many AI/ML models are deployed without proper security audits, making them vulnerable to adversarial attacks, data leakage, and extraction. AutoScanML helps ensure these models are secure, trustworthy, and compliant before going live.

## 🛠️ Tech Stack

- **Core Language:** Python
- **Frontend:** React.js
- **API Framework:** Flask (upload + result endpoints)
- **Security Libraries:** ART (Adversarial Robustness Toolbox), CleverHans
- **Database:** PostgreSQL
- **Report Generation:** Jinja2, PDFKit, xlsxwriter (optional)
- **Version Control:** Git (feature branches → review → merge to main)

## 📁 Project Structure

```
AutoScanML/
├── scanner/     # Core vulnerability analysis engine
├── api/         # Flask/FastAPI for model uploads and scanning
├── config/      # Security rules and thresholds
├── docs/        # Documentation and setup guide
├── tests/       # Unit and integration tests
└── README.md    # Project overview
```

## 🧠 Attacks Detected

| Attack Type               | Detection Strategy |
|--------------------------|---------------------|
| Adversarial Input Attack | Tests input sensitivity using ART |
| Model Inversion          | Flags over-sensitive output exposure |
| Model Theft              | Warns on public APIs without rate limiting |
| Data Poisoning           | Checks for data anomalies and imbalance |
| Backdoor Attacks         | Detects unusual model behavior |
| Insecure Serialization   | Flags risky formats like Pickle |
| Lack of Input Validation | Checks absence of pre-processing |
| API Overexposure         | Alerts on public, unsecured endpoints |
| Membership Inference     | Identifies overfit models |
| Output Leaks             | Checks for excessive metadata exposure |

## 🚀 Getting Started

1. Clone the repo:
```bash
git clone https://github.com/your-org/AutoScanML.git
cd AutoScanML
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask API:
```bash
python api/app.py
```

4. Upload a model and view results on `http://localhost:5000`

## 🤝 Contributing

Pull requests are welcome. Please open an issue first to discuss what you’d like to change or improve.

## 📄 License

MIT License © 2025 Swajyot Intern Team
