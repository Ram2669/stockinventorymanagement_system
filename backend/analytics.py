from flask import Blueprint, request, jsonify
from models import db, Sale, Stock
from datetime import datetime, timedelta
from sqlalchemy import func, desc, case

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Get comprehensive dashboard statistics for admin"""
    try:
        # Time periods
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Basic stats
        total_sales = Sale.query.count()
        total_revenue = db.session.query(func.sum(Sale.sale_amount)).scalar() or 0
        
        # Today's stats
        today_sales = Sale.query.filter(func.date(Sale.sale_date) == today).count()
        today_revenue = db.session.query(func.sum(Sale.sale_amount)).filter(
            func.date(Sale.sale_date) == today
        ).scalar() or 0
        
        # Weekly stats
        weekly_sales = Sale.query.filter(Sale.sale_date >= week_ago).count()
        weekly_revenue = db.session.query(func.sum(Sale.sale_amount)).filter(
            Sale.sale_date >= week_ago
        ).scalar() or 0
        
        # Monthly stats
        monthly_sales = Sale.query.filter(Sale.sale_date >= month_ago).count()
        monthly_revenue = db.session.query(func.sum(Sale.sale_amount)).filter(
            Sale.sale_date >= month_ago
        ).scalar() or 0
        
        # Payment stats
        paid_amount = db.session.query(func.sum(Sale.sale_amount)).filter(
            Sale.payment_status == 'paid'
        ).scalar() or 0
        
        unpaid_amount = db.session.query(func.sum(Sale.sale_amount)).filter(
            Sale.payment_status == 'unpaid'
        ).scalar() or 0
        
        # Stock stats
        total_products = Stock.query.count()
        low_stock_items = Stock.query.filter(Stock.quantity <= 10).count()
        out_of_stock_items = Stock.query.filter(Stock.quantity == 0).count()
        
        return jsonify({
            'total_stats': {
                'total_sales': total_sales,
                'total_revenue': float(total_revenue),
                'total_products': total_products,
                'low_stock_items': low_stock_items,
                'out_of_stock_items': out_of_stock_items
            },
            'today_stats': {
                'sales': today_sales,
                'revenue': float(today_revenue)
            },
            'weekly_stats': {
                'sales': weekly_sales,
                'revenue': float(weekly_revenue)
            },
            'monthly_stats': {
                'sales': monthly_sales,
                'revenue': float(monthly_revenue)
            },
            'payment_stats': {
                'paid_amount': float(paid_amount),
                'unpaid_amount': float(unpaid_amount),
                'payment_rate': (paid_amount / total_revenue * 100) if total_revenue > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/top-selling-products', methods=['GET'])
def get_top_selling_products():
    """Get top selling products by quantity and revenue"""
    try:
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Top products by quantity
        top_by_quantity = db.session.query(
            Sale.product_name,
            Sale.company_name,
            func.sum(Sale.quantity_sold).label('total_quantity'),
            func.count(Sale.id).label('sale_count'),
            func.sum(Sale.sale_amount).label('total_revenue')
        ).filter(
            Sale.sale_date >= start_date
        ).group_by(
            Sale.product_name, Sale.company_name
        ).order_by(
            desc('total_quantity')
        ).limit(limit).all()
        
        # Top products by revenue
        top_by_revenue = db.session.query(
            Sale.product_name,
            Sale.company_name,
            func.sum(Sale.quantity_sold).label('total_quantity'),
            func.count(Sale.id).label('sale_count'),
            func.sum(Sale.sale_amount).label('total_revenue')
        ).filter(
            Sale.sale_date >= start_date
        ).group_by(
            Sale.product_name, Sale.company_name
        ).order_by(
            desc('total_revenue')
        ).limit(limit).all()
        
        return jsonify({
            'top_by_quantity': [{
                'product_name': item.product_name,
                'company_name': item.company_name,
                'total_quantity': int(item.total_quantity),
                'sale_count': int(item.sale_count),
                'total_revenue': float(item.total_revenue),
                'avg_price': float(item.total_revenue / item.total_quantity) if item.total_quantity > 0 else 0
            } for item in top_by_quantity],
            'top_by_revenue': [{
                'product_name': item.product_name,
                'company_name': item.company_name,
                'total_quantity': int(item.total_quantity),
                'sale_count': int(item.sale_count),
                'total_revenue': float(item.total_revenue),
                'avg_price': float(item.total_revenue / item.total_quantity) if item.total_quantity > 0 else 0
            } for item in top_by_revenue],
            'period_days': days
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/customer-analysis', methods=['GET'])
def get_customer_analysis():
    """Get customer purchase analysis"""
    try:
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Top customers by revenue
        top_customers = db.session.query(
            Sale.customer_name,
            func.sum(Sale.sale_amount).label('total_spent'),
            func.count(Sale.id).label('purchase_count'),
            func.sum(Sale.quantity_sold).label('total_items'),
            func.avg(Sale.sale_amount).label('avg_purchase')
        ).filter(
            Sale.sale_date >= start_date
        ).group_by(
            Sale.customer_name
        ).order_by(
            desc('total_spent')
        ).limit(limit).all()
        
        # Customer payment behavior
        customer_payments = db.session.query(
            Sale.customer_name,
            func.sum(case((Sale.payment_status == 'paid', Sale.sale_amount), else_=0)).label('paid_amount'),
            func.sum(case((Sale.payment_status == 'unpaid', Sale.sale_amount), else_=0)).label('unpaid_amount'),
            func.sum(Sale.sale_amount).label('total_amount')
        ).filter(
            Sale.sale_date >= start_date
        ).group_by(
            Sale.customer_name
        ).having(
            func.sum(Sale.sale_amount) > 0
        ).order_by(
            desc('total_amount')
        ).limit(limit).all()
        
        return jsonify({
            'top_customers': [{
                'customer_name': customer.customer_name,
                'total_spent': float(customer.total_spent),
                'purchase_count': int(customer.purchase_count),
                'total_items': int(customer.total_items),
                'avg_purchase': float(customer.avg_purchase)
            } for customer in top_customers],
            'payment_behavior': [{
                'customer_name': customer.customer_name,
                'paid_amount': float(customer.paid_amount),
                'unpaid_amount': float(customer.unpaid_amount),
                'total_amount': float(customer.total_amount),
                'payment_rate': (customer.paid_amount / customer.total_amount * 100) if customer.total_amount > 0 else 0
            } for customer in customer_payments],
            'period_days': days
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/stock-movement', methods=['GET'])
def get_stock_movement():
    """Get stock movement analysis"""
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Products with sales in the period
        stock_movement = db.session.query(
            Stock.product_name,
            Stock.company_name,
            Stock.quantity.label('current_stock'),
            func.coalesce(func.sum(Sale.quantity_sold), 0).label('sold_quantity'),
            func.count(Sale.id).label('sale_transactions')
        ).outerjoin(
            Sale, 
            (Stock.product_name == Sale.product_name) & 
            (Stock.company_name == Sale.company_name) &
            (Sale.sale_date >= start_date)
        ).group_by(
            Stock.id, Stock.product_name, Stock.company_name, Stock.quantity
        ).order_by(
            desc('sold_quantity')
        ).all()
        
        # Calculate stock velocity (sales per day)
        movement_data = []
        for item in stock_movement:
            velocity = item.sold_quantity / days if days > 0 else 0
            days_until_stockout = item.current_stock / velocity if velocity > 0 else float('inf')
            
            movement_data.append({
                'product_name': item.product_name,
                'company_name': item.company_name,
                'current_stock': int(item.current_stock),
                'sold_quantity': int(item.sold_quantity),
                'sale_transactions': int(item.sale_transactions),
                'velocity_per_day': round(velocity, 2),
                'days_until_stockout': int(days_until_stockout) if days_until_stockout != float('inf') else None,
                'stock_status': 'Critical' if item.current_stock <= 5 else 'Low' if item.current_stock <= 10 else 'Good'
            })
        
        return jsonify({
            'stock_movement': movement_data,
            'period_days': days,
            'analysis_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/low-stock-alerts', methods=['GET'])
def get_low_stock_alerts():
    """Get low stock alerts for sales persons"""
    try:
        threshold = request.args.get('threshold', 10, type=int)
        
        low_stock_items = Stock.query.filter(
            Stock.quantity <= threshold
        ).order_by(Stock.quantity.asc()).all()
        
        alerts = []
        for item in low_stock_items:
            status = 'Out of Stock' if item.quantity == 0 else 'Critical' if item.quantity <= 5 else 'Low Stock'
            alerts.append({
                'id': item.id,
                'product_name': item.product_name,
                'company_name': item.company_name,
                'current_quantity': item.quantity,
                'status': status,
                'alert_level': 'danger' if item.quantity <= 5 else 'warning'
            })
        
        return jsonify({
            'alerts': alerts,
            'total_alerts': len(alerts),
            'threshold': threshold
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
