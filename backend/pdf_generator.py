from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime, timedelta
from models import Sale, db
import io
import os

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1,  # Center alignment
            textColor=colors.darkblue
        )
        
    def generate_weekly_report_by_customer(self):
        """Generate PDF report grouped by customer name"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # Get weekly sales data
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        sales = Sale.query.filter(
            Sale.sale_date >= start_date,
            Sale.sale_date <= end_date
        ).order_by(Sale.customer_name, Sale.sale_date).all()
        
        # Build PDF content
        story = []
        
        # Title
        title = Paragraph("SRI LAKSHMI ENTERPRISES", self.title_style)
        subtitle = Paragraph(f"Weekly Sales Report by Customer<br/>({start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')})", 
                            self.styles['Heading2'])
        story.append(title)
        story.append(subtitle)
        story.append(Spacer(1, 20))
        
        # Group sales by customer
        customer_sales = {}
        for sale in sales:
            if sale.customer_name not in customer_sales:
                customer_sales[sale.customer_name] = []
            customer_sales[sale.customer_name].append(sale)
        
        # Create tables for each customer
        for customer_name, customer_sale_list in customer_sales.items():
            # Customer header
            customer_header = Paragraph(f"Customer: {customer_name}", self.styles['Heading3'])
            story.append(customer_header)
            story.append(Spacer(1, 10))
            
            # Table data
            data = [['Date', 'Product Name', 'Company', 'Qty', 'Unit Price', 'Amount (Rs.)']]
            total_amount = 0

            for sale in customer_sale_list:
                data.append([
                    sale.sale_date.strftime('%Y-%m-%d'),
                    sale.product_name,
                    sale.company_name,
                    str(sale.quantity_sold),
                    f"Rs.{sale.unit_price:.2f}",
                    f"Rs.{sale.sale_amount:.2f}"
                ])
                total_amount += sale.sale_amount

            # Add total row
            data.append(['', '', '', '', 'Total:', f"Rs.{total_amount:.2f}"])

            # Create table
            table = Table(data, colWidths=[1*inch, 1.8*inch, 1.2*inch, 0.6*inch, 1*inch, 1.4*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_weekly_report_by_date(self):
        """Generate PDF report grouped by date"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # Get weekly sales data
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        sales = Sale.query.filter(
            Sale.sale_date >= start_date,
            Sale.sale_date <= end_date
        ).order_by(Sale.sale_date, Sale.customer_name).all()
        
        # Build PDF content
        story = []
        
        # Title
        title = Paragraph("SRI LAKSHMI ENTERPRISES", self.title_style)
        subtitle = Paragraph(f"Weekly Sales Report by Date<br/>({start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')})", 
                            self.styles['Heading2'])
        story.append(title)
        story.append(subtitle)
        story.append(Spacer(1, 20))
        
        # Group sales by date
        date_sales = {}
        for sale in sales:
            date_key = sale.sale_date.strftime('%Y-%m-%d')
            if date_key not in date_sales:
                date_sales[date_key] = []
            date_sales[date_key].append(sale)
        
        # Create tables for each date
        for date_key, date_sale_list in sorted(date_sales.items()):
            # Date header
            date_header = Paragraph(f"Date: {date_key}", self.styles['Heading3'])
            story.append(date_header)
            story.append(Spacer(1, 10))
            
            # Table data
            data = [['Customer Name', 'Product Name', 'Company', 'Qty', 'Unit Price', 'Amount (Rs.)']]
            total_amount = 0

            for sale in date_sale_list:
                data.append([
                    sale.customer_name,
                    sale.product_name,
                    sale.company_name,
                    str(sale.quantity_sold),
                    f"Rs.{sale.unit_price:.2f}",
                    f"Rs.{sale.sale_amount:.2f}"
                ])
                total_amount += sale.sale_amount

            # Add total row
            data.append(['', '', '', '', 'Total:', f"Rs.{total_amount:.2f}"])

            # Create table
            table = Table(data, colWidths=[1.3*inch, 1.7*inch, 1.2*inch, 0.6*inch, 1*inch, 1.2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
        
        doc.build(story)
        buffer.seek(0)
        return buffer

    def generate_receipt(self, sale_data):
        """Generate PDF receipt for a single sale"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=72)

        # Build receipt content
        story = []

        # Company Header with styling
        company_style = ParagraphStyle(
            'CompanyHeader',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=10,
            alignment=1,
            textColor=colors.darkblue,
            fontName='Helvetica-Bold'
        )

        receipt_style = ParagraphStyle(
            'ReceiptTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=1,
            textColor=colors.darkred
        )

        # Header
        story.append(Paragraph("SRI LAKSHMI ENTERPRISES", company_style))
        story.append(Paragraph("SALES RECEIPT", receipt_style))
        story.append(Spacer(1, 20))

        # Receipt details in a professional layout
        receipt_info = [
            ['Receipt No:', f"RCP-{sale_data['id']:06d}"],
            ['Date:', sale_data['sale_date']],
            ['Customer:', sale_data['customer_name']],
            ['', '']
        ]

        info_table = Table(receipt_info, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))

        story.append(info_table)
        story.append(Spacer(1, 30))

        # Items table
        items_data = [
            ['Item Description', 'Company', 'Qty', 'Unit Price', 'Amount'],
            [
                sale_data['product_name'],
                sale_data['company_name'],
                str(sale_data['quantity_sold']),
                f"Rs.{sale_data['unit_price']:.2f}",
                f"Rs.{sale_data['sale_amount']:.2f}"
            ]
        ]

        items_table = Table(items_data, colWidths=[2.5*inch, 1.5*inch, 0.8*inch, 1*inch, 1.2*inch])
        items_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

            # Data styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
            ('ALIGN', (0, 1), (1, -1), 'LEFT'),
            ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))

        story.append(items_table)
        story.append(Spacer(1, 20))

        # Total section
        total_data = [
            ['', '', '', 'TOTAL:', f"Rs.{sale_data['sale_amount']:.2f}"]
        ]

        total_table = Table(total_data, colWidths=[2.5*inch, 1.5*inch, 0.8*inch, 1*inch, 1.2*inch])
        total_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('ALIGN', (3, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (3, 0), (-1, -1), colors.lightgrey),
            ('BOX', (3, 0), (-1, -1), 2, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))

        story.append(total_table)
        story.append(Spacer(1, 40))

        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=1,
            textColor=colors.grey
        )

        story.append(Paragraph("Thank you for your business!", footer_style))
        story.append(Paragraph("Visit us again!", footer_style))

        doc.build(story)
        buffer.seek(0)
        return buffer
