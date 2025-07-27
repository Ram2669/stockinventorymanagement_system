from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'company_name': self.company_name,
            'quantity': self.quantity,
            'date_added': self.date_added.strftime('%Y-%m-%d %H:%M:%S')
        }

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    sale_amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False, default='unpaid')  # 'paid' or 'unpaid'
    payment_date = db.Column(db.DateTime, nullable=True)  # When payment was received
    payment_method = db.Column(db.String(50), nullable=True)  # cash, card, upi, etc.
    sale_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'company_name': self.company_name,
            'quantity_sold': self.quantity_sold,
            'customer_name': self.customer_name,
            'unit_price': self.unit_price,
            'sale_amount': self.sale_amount,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.strftime('%Y-%m-%d %H:%M:%S') if self.payment_date else None,
            'payment_method': self.payment_method,
            'sale_date': self.sale_date.strftime('%Y-%m-%d %H:%M:%S')
        }
