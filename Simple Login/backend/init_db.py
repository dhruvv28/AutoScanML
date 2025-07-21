from app import create_app, db
from app.models import User  

def create_admin_user():
    app = create_app()
    with app.app_context():
        db.create_all()

        if not User.query.filter_by(username='admin').first():
            user = User(username='admin')
            user.set_password('admin123')
            db.session.add(user)
            db.session.commit()
            print("✅ Admin user created: admin / admin123")
        else:
            print("ℹ️ Admin user already exists.")

if __name__ == '__main__':
    create_admin_user()
