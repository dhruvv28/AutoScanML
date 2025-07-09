from flask import Blueprint, request, jsonify, send_from_directory
from .models import User, db
import os
from werkzeug.utils import secure_filename
from app import db
from app.models import UploadedModel, Vulnerability
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from app import mail
from datetime import datetime, timedelta
import random
from .scanner import scan_model
from .report_generator import generate_pdf_report
from .dynamic_scanner import run_dynamic_scanner, run_adversarial_scanner
import uuid

auth_blueprint = Blueprint('auth', __name__)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'h5', 'pkl', 'pt', 'joblib', 'onnx', 'sav', 'model', 'bin', 'zip', 'tar', 'gz', 
                     'pytorch', 'keras', 'pb', 'tflite', 'pmml', 'mlmodel', 'xgb', 'cbm', 'pickle', 
                     'txt', 'csv', 'json', 'xml', 'yml', 'yaml'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_blueprint.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing credentials'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

@auth_blueprint.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create uploads directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Save to database
        report_filename = f'report_{uuid.uuid4().hex}.pdf'
        report_path = os.path.join(UPLOAD_FOLDER, report_filename)
        uploaded_model = UploadedModel(
            filename=filename,
            file_path=file_path,
            report_path=report_filename,
            status='pending'
        )
        db.session.add(uploaded_model)
        db.session.commit()
        
        code_lines, static_vulns = scan_model(file_path)
        dynamic_vulns = run_dynamic_scanner(file_path)
        adversarial_vulns = run_adversarial_scanner(file_path)
        generate_pdf_report(
            code_lines,
            static_vulns,         # from scanner.py
            dynamic_vulns,        # from dynamic_scanner.py
            adversarial_vulns,    # from dynamic_scanner.py (adversarial results)
            report_path,
            filename
        )
        
        # Helper to flatten and tag vulnerabilities
        def flatten_vulns(vulns, vtype):
            for v in vulns:
                yield Vulnerability(
                    model_id=uploaded_model.id,
                    type=vtype,
                    title=v.get('title') or v.get('attack') or v.get('Vulnerability'),
                    severity=v.get('severity', 'Low'),
                    description=v.get('description', v.get('code', '')),
                    details=v.get('details', ''),
                    line=v.get('line')
                )

        # Save all vulnerabilities
        all_vulns = list(flatten_vulns(static_vulns, 'static')) + \
                    list(flatten_vulns(dynamic_vulns, 'dynamic')) + \
                    list(flatten_vulns(adversarial_vulns, 'adversarial'))

        for vuln in all_vulns:
            db.session.add(vuln)

        # Calculate risk score (simple example: high if any High severity)
        high_risk = any(v.severity.lower() == 'high' for v in all_vulns)
        uploaded_model.high_risk = high_risk
        uploaded_model.risk_score = sum({'low': 1, 'medium': 2, 'high': 3}.get(v.severity.lower(), 1) for v in all_vulns)

        db.session.commit()
        
        # Return the full URL for the report
        report_url = f'http://localhost:5000/uploads/{report_filename}'
        return jsonify({'report_url': report_url}), 201
    
    return jsonify({'error': 'File type not allowed'}), 400

@auth_blueprint.route('/api/uploads', methods=['GET'])
def get_uploads():
    uploads = UploadedModel.query.order_by(UploadedModel.upload_date.desc()).all()
    return jsonify([
        {
            **upload.to_dict(),
            'report_url': f'http://localhost:5000/uploads/{upload.report_path}'
        }
        for upload in uploads
    ])

@auth_blueprint.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    country = data.get('country')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not all([name, country, email, username, password]):
        return jsonify({'error': 'Missing fields'}), 400

    # Check if user/email already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'User or email already exists'}), 409

    hashed_password = generate_password_hash(password)
    user = User(name=name, country=country, email=email, username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@auth_blueprint.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [
        {
            'id': user.id,
            'name': user.name,
            'country': user.country,
            'email': user.email,
            'username': user.username
        }
        for user in users
    ]
    return jsonify(users_data)

@auth_blueprint.route('/api/user/<username>', methods=['GET'])
def get_user_by_username(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'name': user.name,
        'country': user.country,
        'email': user.email,
        'username': user.username
    })

@auth_blueprint.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.json
    username = data.get('username')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not all([username, old_password, new_password]):
        return jsonify({'error': 'Missing fields'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(old_password):
        return jsonify({'error': 'Incorrect existing password'}), 401

    user.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200

@auth_blueprint.route('/api/request-otp', methods=['POST'])
def request_otp():
    print('REQUEST OTP ENDPOINT CALLED')
    data = request.json
    name = data.get('name')
    country = data.get('country')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not all([name, country, email, username, password]):
        return jsonify({'error': 'Missing fields'}), 400

    # Check if user/email already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'User or email already exists'}), 409

    # Generate 4-digit OTP
    otp_code = '{:04d}'.format(random.randint(0, 9999))
    otp_expiry = datetime.utcnow() + timedelta(seconds=180)

    # Store OTP in a temp user (not committed yet)
    temp_user = User(name=name, country=country, email=email, username=username, password=generate_password_hash(password), otp_code=otp_code, otp_expiry=otp_expiry)
    db.session.add(temp_user)
    db.session.commit()

    # Send OTP email
    try:
        msg = Message('Your Swajyot Signup OTP', recipients=[email])
        msg.body = f'Your OTP for Swajyot signup is: {otp_code}\nIt is valid for 3 minutes.'
        mail.send(msg)
    except Exception as e:
        print('EMAIL ERROR:', e)
        db.session.delete(temp_user)
        db.session.commit()
        return jsonify({'error': 'Failed to send OTP email.'}), 500

    return jsonify({'message': 'OTP sent to your email.'}), 200

@auth_blueprint.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp_code = data.get('otp')

    if not all([email, otp_code]):
        return jsonify({'error': 'Missing fields'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.otp_code or not user.otp_expiry:
        return jsonify({'error': 'No OTP request found for this email.'}), 404

    if user.otp_code != otp_code:
        return jsonify({'error': 'Invalid OTP.'}), 400

    if datetime.utcnow() > user.otp_expiry:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'error': 'OTP expired. Please sign up again.'}), 400

    # OTP is valid, clear OTP fields and finalize user
    user.otp_code = None
    user.otp_expiry = None
    db.session.commit()
    return jsonify({'message': 'Account created successfully!'}), 201

@auth_blueprint.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@auth_blueprint.route('/api/models', methods=['GET'])
def get_models():
    models = UploadedModel.query.order_by(UploadedModel.upload_date.desc()).all()
    return jsonify([model.to_dict() for model in models])

@auth_blueprint.route('/api/vulnerabilities', methods=['GET'])
def get_vulnerabilities():
    vulns = Vulnerability.query.order_by(Vulnerability.created_at.desc()).all()
    return jsonify([v.to_dict() for v in vulns])

@auth_blueprint.route('/api/high-risk-models', methods=['GET'])
def get_high_risk_models():
    models = UploadedModel.query.filter_by(high_risk=True).order_by(UploadedModel.upload_date.desc()).all()
    return jsonify([model.to_dict() for model in models])
