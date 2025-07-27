#!/usr/bin/env python3
"""
Migration script to add unit_price column to Stock table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Stock
from sqlalchemy import text

def add_unit_price_column():
    """Add unit_price column to Stock table if it doesn't exist"""

    with app.app_context():
        try:
            # Check if unit_price column already exists (PostgreSQL syntax)
            with db.engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'stock' AND column_name = 'unit_price'
                """))

                column_exists = result.fetchone() is not None

                if not column_exists:
                    print("Adding unit_price column to Stock table...")

                    # Add the unit_price column (PostgreSQL syntax)
                    conn.execute(text("ALTER TABLE stock ADD COLUMN unit_price FLOAT DEFAULT 0.0"))
                    conn.commit()

                    print("✅ unit_price column added successfully!")

                    # Update existing records to have unit_price = 0.0
                    conn.execute(text("UPDATE stock SET unit_price = 0.0 WHERE unit_price IS NULL"))
                    conn.commit()

                    print("✅ Existing records updated with default unit_price!")

                else:
                    print("✅ unit_price column already exists!")

        except Exception as e:
            print(f"❌ Error adding unit_price column: {e}")
            return False

    return True

if __name__ == "__main__":
    print("🔧 Running unit_price column migration...")
    
    if add_unit_price_column():
        print("🎉 Migration completed successfully!")
    else:
        print("❌ Migration failed!")
        sys.exit(1)
