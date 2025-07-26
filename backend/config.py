import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database Configuration
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'sri_lakshmi_user')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'your_secure_password')
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
    POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'sri_lakshmi_db')
    
    # SQLAlchemy Configuration
    SQLALCHEMY_DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration for GitHub Pages
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://your-username.github.io',  # Replace with your GitHub username
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'file://',  # Allow local file access
        'null'  # Allow local file access
    ]

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
