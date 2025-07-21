import os
import torch
import re
import pickle
import hashlib
import pickletools
import uuid
import numpy as np
from sklearn.ensemble import IsolationForest

def scan_model(file_path):
    findings = []
    code_lines = []
    ext = os.path.splitext(file_path)[1].lower()

    # 1. Insecure Serialization Formats
    if ext in ['.pkl', '.pickle', '.joblib']:
        findings.append({
            'line': 1,
            'code': f"File extension: {ext}",
            'severity': 'High',
            'attack': 'Insecure Serialization Format (Pickle/Joblib)'
        })

    if ext in ['.pkl', '.pickle', '.joblib']:
        # Try to load pickle and scan keys/values
        try:
            with open(file_path, 'rb') as f:
                obj = pickle.load(f)
            # If it's a dict, scan keys/values
            if isinstance(obj, dict):
                for k, v in obj.items():
                    line = f"{k}: {v}"
                    code_lines.append(line)
                    # 2. Lack of Model Obfuscation & 3. Plaintext Sensitive Metadata
                    if re.search(r'(layer|weight|bias|label|trainable)', str(k), re.IGNORECASE) or re.search(r'(layer|weight|bias|label|trainable)', str(v), re.IGNORECASE):
                        findings.append({
                            'line': len(code_lines),
                            'code': line,
                            'severity': 'Medium',
                            'attack': 'Lack of Model Obfuscation / Plaintext Metadata'
                        })
                    if re.search(r'(username|password|email|token)', str(k), re.IGNORECASE) or re.search(r'(username|password|email|token)', str(v), re.IGNORECASE):
                        findings.append({
                            'line': len(code_lines),
                            'code': line,
                            'severity': 'High',
                            'attack': 'Plaintext Sensitive Metadata'
                        })
                    if re.search(r'(debug|log|trace|print)', str(k), re.IGNORECASE) or re.search(r'(debug|log|trace|print)', str(v), re.IGNORECASE):
                        findings.append({
                            'line': len(code_lines),
                            'code': line,
                            'severity': 'Low',
                            'attack': 'Exposed Debugging Information'
                        })
                    if re.search(r'(input_shape|shape=)', str(k), re.IGNORECASE) or re.search(r'(input_shape|shape=)', str(v), re.IGNORECASE):
                        findings.append({
                            'line': len(code_lines),
                            'code': line,
                            'severity': 'Medium',
                            'attack': 'Hardcoded Input Shapes Without Validation'
                        })
                    if re.search(r'(lambda|custom|def )', str(k), re.IGNORECASE) or re.search(r'(lambda|custom|def )', str(v), re.IGNORECASE):
                        findings.append({
                            'line': len(code_lines),
                            'code': line,
                            'severity': 'High',
                            'attack': 'Custom Layers or Unsafe Code Artifacts'
                        })
            else:
                # Not a dict, just scan string representation
                code_lines = str(obj).split('\n')
        except Exception as e:
            code_lines = [f'<Could not parse pickle file: {e}>']
    else:
        # Existing logic for .pt and other files
        try:
            if ext == '.pt':
                try:
                    model = torch.jit.load(file_path)
                    code = model.code
                    code_lines = code.split('\n')
                except Exception:
                    # Try loading as a regular PyTorch model
                    try:
                        model = torch.load(file_path)
                        code_lines = str(model).split('\n')
                    except Exception as e:
                        code_lines = [f'<Could not parse model code: {e}>']
                for i, line in enumerate(code_lines, 1):
                    if re.search(r'(layer|weight|bias|label|trainable)', line, re.IGNORECASE):
                        findings.append({
                            'line': i,
                            'code': line,
                            'severity': 'Medium',
                            'attack': 'Lack of Model Obfuscation / Plaintext Metadata'
                        })
                    if re.search(r'(username|password|email|token)', line, re.IGNORECASE):
                        findings.append({
                            'line': i,
                            'code': line,
                            'severity': 'High',
                            'attack': 'Plaintext Sensitive Metadata'
                        })
            else:
                with open(file_path, 'r', errors='ignore') as f:
                    code_lines = f.readlines()
                    for i, line in enumerate(code_lines, 1):
                        if re.search(r'(layer|weight|bias|label|trainable)', line, re.IGNORECASE):
                            findings.append({
                                'line': i,
                                'code': line.strip(),
                                'severity': 'Medium',
                                'attack': 'Lack of Model Obfuscation / Plaintext Metadata'
                            })
                        if re.search(r'(username|password|email|token)', line, re.IGNORECASE):
                            findings.append({
                                'line': i,
                                'code': line.strip(),
                                'severity': 'High',
                                'attack': 'Plaintext Sensitive Metadata'
                            })
        except Exception as e:
            code_lines = ["<Could not parse model code: {}>".format(e)]

    # 4. Missing or Weak File Protection
    findings.append({
        'line': 1,
        'code': "No encryption or signature detected",
        'severity': 'Medium',
        'attack': 'Missing or Weak File Protection'
    })

    # 5. Use of Vulnerable Libraries/Frameworks
    torch_version = torch.__version__
    if torch_version < "2.0.0":  # Example threshold
        findings.append({
            'line': 1,
            'code': f"PyTorch version: {torch_version}",
            'severity': 'Medium',
            'attack': 'Use of Potentially Vulnerable Library'
        })

    # 6. Exposed Debugging Information (for non-pkl files, already checked for pkl above)
    if ext not in ['.pkl', '.pickle', '.joblib']:
        for i, line in enumerate(code_lines, 1):
            if re.search(r'(debug|log|trace|print)', line, re.IGNORECASE):
                findings.append({
                    'line': i,
                    'code': line.strip(),
                    'severity': 'Low',
                    'attack': 'Exposed Debugging Information'
                })

    # 7. Hardcoded Input Shapes Without Validation (for non-pkl files, already checked for pkl above)
    if ext not in ['.pkl', '.pickle', '.joblib']:
        for i, line in enumerate(code_lines, 1):
            if re.search(r'(input_shape|shape=)', line, re.IGNORECASE):
                findings.append({
                    'line': i,
                    'code': line.strip(),
                    'severity': 'Medium',
                    'attack': 'Hardcoded Input Shapes Without Validation'
                })

    # 8. Custom Layers or Unsafe Code Artifacts (for non-pkl files, already checked for pkl above)
    if ext not in ['.pkl', '.pickle', '.joblib']:
        for i, line in enumerate(code_lines, 1):
            if re.search(r'(lambda|custom|def )', line, re.IGNORECASE):
                findings.append({
                    'line': i,
                    'code': line.strip(),
                    'severity': 'High',
                    'attack': 'Custom Layers or Unsafe Code Artifacts'
                })

    # 9. Missing Model Documentation
    if not any('doc' in str(line) or '#' in str(line) for line in code_lines):
        findings.append({
            'line': 1,
            'code': "No documentation or comments found",
            'severity': 'Low',
            'attack': 'Missing Model Documentation'
        })

    # 10. Overly Permissive Permissions
    try:
        perms = oct(os.stat(file_path).st_mode)[-3:]
        if perms in ['777', '666', '755']:
            findings.append({
                'line': 1,
                'code': f"File permissions: {perms}",
                'severity': 'High',
                'attack': 'Overly Permissive Permissions'
            })
    except Exception:
        pass

    return code_lines, findings

def calculate_file_hash(file_path):
    """Calculate SHA256 hash of the file."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

def extract_model_features(file_path):
    """Extract simple features: file size and entropy of first 1024 bytes."""
    try:
        features = [os.path.getsize(file_path)]
        with open(file_path, 'rb') as f:
            data = f.read(1024)
            byte_counts = [0] * 256
            for byte in data:
                byte_counts[byte] += 1
            entropy = -sum((c / len(data)) * np.log2(c / len(data)) for c in byte_counts if c > 0)
            features.append(entropy)
        return features[:10] + [0] * (10 - len(features))  # Pad to 10
    except Exception:
        return []

def anomaly_detection(file_path):
    """Detect anomalous model files using IsolationForest on simple features."""
    features = extract_model_features(file_path)
    if not features:
        return {"anomaly_score": 0.0, "is_anomalous": False, "analysis_complete": False}
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    preds = iso_forest.fit_predict([features])
    score = abs(iso_forest.score_samples([features])[0])
    return {
        "anomaly_score": score,
        "is_anomalous": preds[0] == -1,
        "analysis_complete": True
    }

def pickle_opcode_analysis(file_path):
    """Analyze pickle files for dangerous opcodes."""
    vulnerabilities = []
    try:
        opcodes = []
        with open(file_path, 'rb') as f:
            pickletools.dis(f, opcodes)
        for opcode in opcodes:
            if any(x in str(opcode) for x in ['GLOBAL', 'REDUCE', 'BUILD', 'INST']):
                vulnerabilities.append({
                    "id": str(uuid.uuid4()),
                    "title": "Dangerous Pickle Opcode Detected",
                    "description": f"Unsafe opcode found: {opcode}",
                    "severity": "HIGH",
                    "cwe_id": "CWE-502"
                })
    except Exception as e:
        vulnerabilities.append({
            "id": str(uuid.uuid4()),
            "title": "Pickle Analysis Failed",
            "description": str(e),
            "severity": "MEDIUM",
            "cwe_id": "CWE-20"
        })
    return vulnerabilities

def byte_level_pattern_scan(file_path):
    """Scan first 1024 bytes for suspicious code patterns."""
    vulnerabilities = []
    try:
        with open(file_path, 'rb') as f:
            content = f.read(1024)
            if b'_import_' in content or b'eval(' in content:
                vulnerabilities.append({
                    "id": str(uuid.uuid4()),
                    "title": "Suspicious Code Pattern",
                    "description": "Detected dangerous patterns in file",
                    "severity": "HIGH",
                    "cwe_id": "CWE-95"
                })
    except Exception:
        pass
    return vulnerabilities

def dos_risk_large_file(file_path, threshold_mb=100):
    """Flag large files as potential DoS risk."""
    vulnerabilities = []
    try:
        if os.path.getsize(file_path) > threshold_mb * 1024 * 1024:
            vulnerabilities.append({
                "id": str(uuid.uuid4()),
                "title": "Large Model File",
                "description": "Possible DoS risk from large file size",
                "severity": "LOW",
                "cwe_id": "CWE-400"
            })
    except Exception:
        pass
    return vulnerabilities

def calculate_risk_score(findings):
    """Aggregate risk score from all findings."""
    total, max_score = 0.0, 0.0
    for vuln in findings:
        severity = vuln.get("severity", "LOW")
        weight = 1.0 if severity == "HIGH" else 0.7 if severity == "MEDIUM" else 0.3
        cvss = 7.5 if severity == "HIGH" else 5.0 if severity == "MEDIUM" else 3.0
        total += cvss * weight
        max_score += 10.0
    return round((total / max_score) * 100, 2) if max_score else 0.0

def generate_recommendations(findings):
    """Generate recommendations based on findings."""
    recs = []
    if findings:
        recs.append(f"{len(findings)} vulnerabilities found.")
    else:
        recs.append("No immediate vulnerabilities detected.")
    recs.append("Keep dependencies and libraries up to date.")
    recs.append("Run regular model security scans.")
    return recs
