#!/usr/bin/env python3
"""
Database initialization script for SRI LAKSHMI ENTERPRISES
This script creates the database tables and sets up initial data
"""

import os
import sys
from app import create_app
from models import db, Stock, Sale

def init_database():
    """Initialize the database with tables"""
    app, database, StockModel, SaleModel = create_app()
    
    with app.app_context():
        print("🌾 Initializing SRI LAKSHMI ENTERPRISES Database...")
        
        # Create all tables
        database.create_all()
        print("✅ Database tables created successfully!")

        # Update existing sales records to have payment status if they don't have it
        existing_sales = SaleModel.query.filter(SaleModel.payment_status.is_(None)).all()
        if existing_sales:
            print(f"🔄 Updating {len(existing_sales)} existing sales with payment status...")
            for sale in existing_sales:
                sale.payment_status = 'unpaid'  # Default to unpaid for existing records
            database.session.commit()
            print("✅ Updated existing sales records!")

        # Check if we have any existing data
        stock_count = StockModel.query.count()
        sale_count = SaleModel.query.count()
        
        print(f"📊 Current database status:")
        print(f"   - Stock items: {stock_count}")
        print(f"   - Sales records: {sale_count}")
        
        # Add sample data if database is empty
        if stock_count == 0:
            add_sample_data(database, StockModel, SaleModel)
        
        print("🎉 Database initialization complete!")

def add_sample_data(db, Stock, Sale):
    """Add sample agricultural data"""
    print("🌱 Adding sample agricultural data...")
    
    sample_stocks = [
        {"product_name": "Wheat Seeds", "company_name": "AgriSeeds Ltd", "quantity": 500},
        {"product_name": "Rice Seeds", "company_name": "GreenHarvest Co", "quantity": 300},
        {"product_name": "Corn Seeds", "company_name": "FarmPro Seeds", "quantity": 250},
        {"product_name": "Fertilizer NPK", "company_name": "NutriGrow", "quantity": 100},
        {"product_name": "Pesticide Spray", "company_name": "CropProtect", "quantity": 75},
        {"product_name": "Irrigation Pipes", "company_name": "WaterFlow Systems", "quantity": 200},
        {"product_name": "Garden Tools Set", "company_name": "FarmTools Inc", "quantity": 50},
        {"product_name": "Organic Compost", "company_name": "EcoFarm", "quantity": 150}
    ]
    
    for stock_data in sample_stocks:
        stock = Stock(**stock_data)
        db.session.add(stock)
    
    db.session.commit()
    print(f"✅ Added {len(sample_stocks)} sample stock items")

if __name__ == "__main__":
    init_database()
