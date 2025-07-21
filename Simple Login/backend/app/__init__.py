from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from flask_mail import Mail
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'surajwork.aug28@gmail.com'
    app.config['MAIL_PASSWORD'] = 'jcer rbad gqtt eyzs'
    app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']
    mail.init_app(app)
    
    # Register blueprints
    from app.routes import auth_blueprint
    app.register_blueprint(auth_blueprint)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
