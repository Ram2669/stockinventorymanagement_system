#!/usr/bin/env python3
"""
Database Migration Script for Payment Tracking
Adds payment_status, payment_date, and payment_method columns to existing sales table
"""

import os
import sys
from app import create_app
from models import db
from sqlalchemy import text

def migrate_database():
    """Add payment tracking columns to existing database"""
    app, database, StockModel, SaleModel = create_app()
    
    with app.app_context():
        print("🔄 Migrating database for payment tracking...")
        
        # Get database connection
        connection = database.engine.connect()
        
        try:
            # Check if columns already exist
            result = connection.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'sale'
                AND column_name IN ('payment_status', 'payment_date', 'payment_method')
            """))
            
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Add payment_status column if it doesn't exist
            if 'payment_status' not in existing_columns:
                print("➕ Adding payment_status column...")
                connection.execute(text("""
                    ALTER TABLE sale
                    ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid'
                """))

                # Update existing records to 'unpaid'
                connection.execute(text("""
                    UPDATE sale
                    SET payment_status = 'unpaid'
                    WHERE payment_status IS NULL
                """))
                print("✅ Added payment_status column")
            else:
                print("✅ payment_status column already exists")
            
            # Add payment_date column if it doesn't exist
            if 'payment_date' not in existing_columns:
                print("➕ Adding payment_date column...")
                connection.execute(text("""
                    ALTER TABLE sale
                    ADD COLUMN payment_date TIMESTAMP
                """))
                print("✅ Added payment_date column")
            else:
                print("✅ payment_date column already exists")

            # Add payment_method column if it doesn't exist
            if 'payment_method' not in existing_columns:
                print("➕ Adding payment_method column...")
                connection.execute(text("""
                    ALTER TABLE sale
                    ADD COLUMN payment_method VARCHAR(50)
                """))
                print("✅ Added payment_method column")
            else:
                print("✅ payment_method column already exists")
            
            # Commit the changes
            connection.commit()
            print("🎉 Database migration completed successfully!")
            
            # Verify the migration
            result = connection.execute(text("SELECT COUNT(*) FROM sale"))
            total_sales = result.fetchone()[0]

            result = connection.execute(text("SELECT COUNT(*) FROM sale WHERE payment_status = 'unpaid'"))
            unpaid_sales = result.fetchone()[0]
            
            print(f"📊 Migration Summary:")
            print(f"   - Total sales records: {total_sales}")
            print(f"   - Unpaid sales: {unpaid_sales}")
            print(f"   - Paid sales: {total_sales - unpaid_sales}")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            connection.rollback()
            raise
        finally:
            connection.close()

if __name__ == '__main__':
    migrate_database()
