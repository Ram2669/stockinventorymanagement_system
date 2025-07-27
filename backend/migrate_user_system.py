#!/usr/bin/env python3
"""
Migration script to add user management system tables
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
from models import UserSession

def migrate_user_system():
    """Create user management tables"""
    with app.app_context():
        try:
            print("🔄 Starting user system migration...")
            
            # Create tables
            db.create_all()
            
            print("✅ User management tables created successfully!")
            print("\n📋 Tables created:")
            print("   - user (User accounts)")
            print("   - user_session (Session management)")
            
            # Check if admin exists
            admin_exists = User.query.filter_by(role='admin').first()
            if admin_exists:
                print(f"\n👨‍💼 Admin user already exists: {admin_exists.username}")
            else:
                print("\n⚠️  No admin user found. You need to register an admin user.")
                print("   Use the /api/auth/register/admin endpoint to create the first admin.")
            
            print("\n🎯 Next steps:")
            print("   1. Register admin user via API: POST /api/auth/register/admin")
            print("   2. Admin can then create salesperson accounts")
            print("   3. Users can login via: POST /api/auth/login")
            
            return True
            
        except Exception as e:
            print(f"❌ Error during migration: {str(e)}")
            return False

if __name__ == "__main__":
    success = migrate_user_system()
    if success:
        print("\n🎉 User system migration completed successfully!")
    else:
        print("\n💥 Migration failed!")
        sys.exit(1)
