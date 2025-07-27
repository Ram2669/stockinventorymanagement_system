from flask import Blueprint, request, jsonify, session
from models import db, User, UserSession
from datetime import datetime, timedelta
import secrets
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # At least 6 characters, contains letter and number
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Valid password"

@auth_bp.route('/register/admin', methods=['POST'])
def register_admin():
    """Register the first admin user - only allowed if no admin exists"""
    try:
        # Check if admin already exists
        existing_admin = User.query.filter_by(role='admin').first()
        if existing_admin:
            return jsonify({'error': 'Admin already exists. Only one admin registration allowed.'}), 400

        data = request.get_json()
        required_fields = ['username', 'email', 'password', 'full_name']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Validate email
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': message}), 400

        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # Create admin user
        admin_user = User(
            username=data['username'],
            email=data['email'],
            full_name=data['full_name'],
            role='admin'
        )
        admin_user.set_password(data['password'])
        
        db.session.add(admin_user)
        db.session.commit()

        return jsonify({
            'message': 'Admin registered successfully',
            'user': admin_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register/salesperson', methods=['POST'])
def register_salesperson():
    """Register a salesperson - only admin can do this"""
    try:
        # Check if user is admin (in a real app, you'd check session/token)
        # For now, we'll require admin_id in the request
        data = request.get_json()
        
        if not data.get('admin_id'):
            return jsonify({'error': 'Admin ID required to create salesperson'}), 400

        admin = User.query.filter_by(id=data['admin_id'], role='admin').first()
        if not admin:
            return jsonify({'error': 'Invalid admin or admin not found'}), 400

        required_fields = ['username', 'email', 'password', 'full_name']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Validate email
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': message}), 400

        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # Create salesperson
        salesperson = User(
            username=data['username'],
            email=data['email'],
            full_name=data['full_name'],
            role='salesperson',
            created_by=admin.id
        )
        salesperson.set_password(data['password'])
        
        db.session.add(salesperson)
        db.session.commit()

        return jsonify({
            'message': 'Salesperson registered successfully',
            'user': salesperson.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and create session"""
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400

        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401

        # Create session token
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)  # 24 hour session

        user_session = UserSession(
            user_id=user.id,
            session_token=session_token,
            expires_at=expires_at
        )
        
        # Update last login
        user.last_login = datetime.utcnow()
        
        db.session.add(user_session)
        db.session.commit()

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'session_token': session_token,
            'expires_at': expires_at.strftime('%Y-%m-%d %H:%M:%S')
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user and invalidate session"""
    try:
        data = request.get_json()
        session_token = data.get('session_token')
        
        if not session_token:
            return jsonify({'error': 'Session token required'}), 400

        user_session = UserSession.query.filter_by(session_token=session_token).first()
        if user_session:
            user_session.is_active = False
            db.session.commit()

        return jsonify({'message': 'Logout successful'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-session', methods=['POST'])
def verify_session():
    """Verify if session token is valid"""
    try:
        data = request.get_json()
        session_token = data.get('session_token')
        
        if not session_token:
            return jsonify({'error': 'Session token required'}), 400

        user_session = UserSession.query.filter_by(
            session_token=session_token,
            is_active=True
        ).first()

        if not user_session or user_session.expires_at < datetime.utcnow():
            return jsonify({'error': 'Invalid or expired session'}), 401

        user = User.query.get(user_session.user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or deactivated'}), 401

        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/users', methods=['GET'])
def get_users():
    """Get all users - admin only"""
    try:
        # In a real app, you'd verify admin session here
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/check-admin-exists', methods=['GET'])
def check_admin_exists():
    """Check if admin user already exists"""
    try:
        admin_exists = User.query.filter_by(role='admin').first() is not None
        return jsonify({'admin_exists': admin_exists}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
