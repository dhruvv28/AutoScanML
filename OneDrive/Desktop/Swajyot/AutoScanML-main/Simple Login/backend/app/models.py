from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    otp_code = db.Column(db.String(10), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

class UploadedModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='pending')
    report_path = db.Column(db.String, nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    risk_score = db.Column(db.Float, nullable=True)
    high_risk = db.Column(db.Boolean, default=False)
    # Relationship to vulnerabilities
    vulnerabilities = db.relationship('Vulnerability', backref='model', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_path': self.file_path,
            'status': self.status,
            'report_path': self.report_path,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'risk_score': self.risk_score,
            'high_risk': self.high_risk
        }

class Vulnerability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('uploaded_model.id'), nullable=False)
    type = db.Column(db.String(50))  # static, dynamic, adversarial
    title = db.Column(db.String(255))
    severity = db.Column(db.String(20))
    description = db.Column(db.Text)
    details = db.Column(db.Text)
    line = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'model_id': self.model_id,
            'type': self.type,
            'title': self.title,
            'severity': self.severity,
            'description': self.description,
            'details': self.details,
            'line': self.line,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ScanReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(256), nullable=False)
    scan_date = db.Column(db.DateTime, default=datetime.utcnow)
    risk_score = db.Column(db.Float)
    risk_level = db.Column(db.String(32))
    issues = db.Column(db.Integer)
    report_url = db.Column(db.String(512))
    recommendations = db.Column(db.Text)
