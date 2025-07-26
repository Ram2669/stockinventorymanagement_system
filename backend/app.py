from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timedelta
import os
from config import config

def create_app(config_name=None):
    app = Flask(__name__)

    # Load configuration
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])

    # Import models and initialize db
    from models import db, Stock, Sale

    db.init_app(app)
    migrate = Migrate(app, db)

    # Configure CORS for GitHub Pages
    CORS(app, origins=app.config['CORS_ORIGINS'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'])

    return app, db, Stock, Sale

app, db, Stock, Sale = create_app()

# Create tables
with app.app_context():
    db.create_all()

# Root route for testing
@app.route('/')
def home():
    return jsonify({
        "message": "🌾 SRI LAKSHMI ENTERPRISES API Server",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "stock": "/api/stock",
            "sales": "/api/sales",
            "reports": "/api/reports",
            "search": "/api/stock/search"
        }
    })

# Duplicate route removed - using the one above

# Stock Management Endpoints
@app.route('/api/stock', methods=['GET'])
def get_stock():
    stocks = Stock.query.all()
    return jsonify([stock.to_dict() for stock in stocks])

@app.route('/api/stock', methods=['POST'])
def add_stock():
    data = request.get_json()

    # Check if product already exists
    existing_stock = Stock.query.filter_by(
        product_name=data['product_name'],
        company_name=data['company_name']
    ).first()

    if existing_stock:
        existing_stock.quantity += int(data['quantity'])
        existing_stock.date_added = datetime.utcnow()
    else:
        new_stock = Stock(
            product_name=data['product_name'],
            company_name=data['company_name'],
            quantity=int(data['quantity'])
        )
        db.session.add(new_stock)

    db.session.commit()
    return jsonify({"message": "Stock added successfully"}), 201

@app.route('/api/stock/<int:stock_id>', methods=['PUT'])
def update_stock(stock_id):
    stock = Stock.query.get_or_404(stock_id)
    data = request.get_json()

    stock.product_name = data.get('product_name', stock.product_name)
    stock.company_name = data.get('company_name', stock.company_name)
    stock.quantity = int(data.get('quantity', stock.quantity))

    db.session.commit()
    return jsonify({"message": "Stock updated successfully"})

@app.route('/api/stock/<int:stock_id>', methods=['DELETE'])
def delete_stock(stock_id):
    stock = Stock.query.get_or_404(stock_id)
    db.session.delete(stock)
    db.session.commit()
    return jsonify({"message": "Stock deleted successfully"})

@app.route('/api/stock/search', methods=['GET'])
def search_stock():
    query = request.args.get('q', '').strip()
    filter_type = request.args.get('filter', 'all')
    sort_by = request.args.get('sort', 'name')

    # Start with base query
    stock_query = Stock.query

    # Apply text search
    if query:
        stock_query = stock_query.filter(
            db.or_(
                Stock.product_name.ilike(f'%{query}%'),
                Stock.company_name.ilike(f'%{query}%')
            )
        )

    # Apply filters
    if filter_type == 'in-stock':
        stock_query = stock_query.filter(Stock.quantity > 0)
    elif filter_type == 'low-stock':
        stock_query = stock_query.filter(Stock.quantity > 0, Stock.quantity < 10)
    elif filter_type == 'out-of-stock':
        stock_query = stock_query.filter(Stock.quantity == 0)

    # Apply sorting
    if sort_by == 'name':
        stock_query = stock_query.order_by(Stock.product_name)
    elif sort_by == 'company':
        stock_query = stock_query.order_by(Stock.company_name)
    elif sort_by == 'quantity':
        stock_query = stock_query.order_by(Stock.quantity.desc())
    elif sort_by == 'date':
        stock_query = stock_query.order_by(Stock.date_added.desc())

    stocks = stock_query.all()
    return jsonify([stock.to_dict() for stock in stocks])

# Sales Management Endpoints
@app.route('/api/sales', methods=['GET'])
def get_sales():
    sales = Sale.query.all()
    return jsonify([sale.to_dict() for sale in sales])

@app.route('/api/sales', methods=['POST'])
def record_sale():
    data = request.get_json()

    # Check if enough stock is available
    stock = Stock.query.filter_by(
        product_name=data['product_name'],
        company_name=data['company_name']
    ).first()

    if not stock:
        return jsonify({"error": "Product not found in stock"}), 400

    if stock.quantity < int(data['quantity_sold']):
        return jsonify({"error": "Insufficient stock"}), 400

    # Calculate total amount from unit price and quantity
    unit_price = float(data['unit_price'])
    quantity_sold = int(data['quantity_sold'])
    total_amount = unit_price * quantity_sold

    # Record the sale
    new_sale = Sale(
        product_name=data['product_name'],
        company_name=data['company_name'],
        quantity_sold=quantity_sold,
        customer_name=data['customer_name'],
        unit_price=unit_price,
        sale_amount=total_amount
    )

    # Update stock quantity
    stock.quantity -= int(data['quantity_sold'])

    db.session.add(new_sale)
    db.session.commit()

    return jsonify({
        "message": "Sale recorded successfully",
        "sale_id": new_sale.id
    }), 201

@app.route('/api/sales/weekly', methods=['GET'])
def get_weekly_sales():
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    sales = Sale.query.filter(
        Sale.sale_date >= start_date,
        Sale.sale_date <= end_date
    ).all()

    return jsonify([sale.to_dict() for sale in sales])

# PDF Generation Endpoints
@app.route('/api/reports/weekly/customer', methods=['GET'])
def generate_customer_report():
    from pdf_generator import PDFGenerator

    pdf_gen = PDFGenerator()
    buffer = pdf_gen.generate_weekly_report_by_customer()

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'weekly_report_by_customer_{datetime.now().strftime("%Y%m%d")}.pdf',
        mimetype='application/pdf'
    )

@app.route('/api/reports/weekly/date', methods=['GET'])
def generate_date_report():
    from pdf_generator import PDFGenerator

    pdf_gen = PDFGenerator()
    buffer = pdf_gen.generate_weekly_report_by_date()

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'weekly_report_by_date_{datetime.now().strftime("%Y%m%d")}.pdf',
        mimetype='application/pdf'
    )

@app.route('/api/receipt/<int:sale_id>', methods=['GET'])
def generate_receipt(sale_id):
    from pdf_generator import PDFGenerator

    # Get sale data
    sale = Sale.query.get_or_404(sale_id)

    sale_data = {
        'id': sale.id,
        'product_name': sale.product_name,
        'company_name': sale.company_name,
        'quantity_sold': sale.quantity_sold,
        'customer_name': sale.customer_name,
        'sale_amount': sale.sale_amount,
        'sale_date': sale.sale_date.strftime('%Y-%m-%d %H:%M:%S')
    }

    pdf_gen = PDFGenerator()
    buffer = pdf_gen.generate_receipt(sale_data)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'receipt_{sale_id}_{datetime.now().strftime("%Y%m%d")}.pdf',
        mimetype='application/pdf'
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
