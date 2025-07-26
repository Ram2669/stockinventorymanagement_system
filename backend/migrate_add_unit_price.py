#!/usr/bin/env python3
"""
Migration script to add unit_price column to existing sales records
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from app import create_app
from models import db, Sale

def migrate_add_unit_price():
    """Add unit_price column to existing sales records"""
    
    print("🔄 Starting migration: Add unit_price column to sales")
    
    # Create app context
    app, db_instance, Stock, Sale = create_app()
    
    with app.app_context():
        try:
            # Check if unit_price column already exists
            from sqlalchemy import inspect
            inspector = inspect(db_instance.engine)
            columns = [col['name'] for col in inspector.get_columns('sale')]
            
            if 'unit_price' in columns:
                print("✅ unit_price column already exists")
                return
            
            # Add the unit_price column
            print("📝 Adding unit_price column to sales table...")
            with db_instance.engine.connect() as connection:
                connection.execute(db_instance.text('ALTER TABLE sale ADD COLUMN unit_price FLOAT'))
                connection.commit()
            
            # Update existing records with calculated unit_price
            print("🔄 Updating existing sales records...")
            sales = Sale.query.all()
            
            for sale in sales:
                if sale.quantity_sold > 0:
                    # Calculate unit price from existing sale_amount and quantity
                    calculated_unit_price = sale.sale_amount / sale.quantity_sold
                    sale.unit_price = round(calculated_unit_price, 2)
                else:
                    # Default to 0 if quantity is 0 (shouldn't happen)
                    sale.unit_price = 0.0
            
            # Commit the changes
            db_instance.session.commit()
            
            print(f"✅ Migration completed successfully!")
            print(f"   - Added unit_price column")
            print(f"   - Updated {len(sales)} existing sales records")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            db_instance.session.rollback()
            return False
    
    return True

if __name__ == '__main__':
    print("🌾 SRI LAKSHMI ENTERPRISES - Database Migration")
    print("=" * 50)
    
    success = migrate_add_unit_price()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("Your database now supports unit price calculations.")
    else:
        print("\n❌ Migration failed!")
        print("Please check the error messages above.")
