# 🌾 SRI LAKSHMI ENTERPRISES - Agricultural Stock Management System

A beautiful farming-themed stock management system with PostgreSQL database and GitHub Pages deployment. **Ready to deploy on any system with automated setup scripts!**

## ✨ Features

- 🌾 **Beautiful Farming Theme** - Earth-tone colors and agricultural design
- 📦 **Stock Management** - Add, edit, and track inventory with farming aesthetics
- 💰 **Sales Recording** - Record sales with automatic stock deduction
- 🧾 **Professional Receipts** - Generate PDF receipts for every sale
- 📊 **Farm Dashboard** - Overview of stock levels, sales, and revenue
- 🔍 **Product Search** - Advanced search and filtering capabilities
- 📄 **PDF Reports** - Weekly reports by customer and date
- 🌐 **GitHub Pages Deployment** - Frontend hosted for free
- 🗄️ **PostgreSQL Database** - Robust local database storage
- 🚀 **Cross-Platform** - Works on Windows, macOS, and Linux

## 🎨 Design Theme

The system features a beautiful agricultural theme with:
- **Earth-tone color palette** (greens, browns, golds)
- **Farm-inspired icons** (tractors, seedlings, wheat)
- **Natural gradients** mimicking sunrise over fields
- **Organic shapes** and comfortable spacing
- **Professional yet warm** appearance

## 🛠️ Technology Stack

### Backend
- **Python Flask** - Web framework
- **PostgreSQL** - Production database
- **SQLAlchemy** - Database ORM
- **ReportLab** - PDF generation
- **Flask-CORS** - Cross-origin requests

### Frontend
- **Vanilla JavaScript** - No complex build tools
- **Farming-themed CSS** - Beautiful agricultural design
- **Axios** - API communication
- **GitHub Pages** - Free hosting

## 🚀 Quick Start (Choose Your Platform)

### Windows Users:
```cmd
# 1. Run setup
setup_windows.bat

# 2. Setup database
setup_database_windows.bat

# 3. Start server
start_server_windows.bat
```

### macOS Users:
```bash
# 1. Run setup
./setup_database.sh

# 2. Start system
./quick_start.sh
```

### Linux/Ubuntu Users:
```bash
# 1. Run setup
./setup_linux.sh

# 2. Setup database
./setup_database_linux.sh

# 3. Start server
./start_server_linux.sh
```

### Manual Setup (All Platforms):
See the complete [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
projectstock/
├── backend/                 # Python Flask API
│   ├── app.py              # Main application
│   ├── models.py           # Database models
│   ├── config.py           # Configuration
│   ├── init_db.py          # Database initialization
│   └── run_server.py       # Production server
├── docs/                   # GitHub Pages deployment
│   ├── index.html          # Main frontend
│   ├── styles.css          # Farming theme CSS
│   ├── app.js              # JavaScript functionality
│   └── config.js           # API configuration
├── frontend_simple/        # Local development frontend
├── setup_database.sh       # Database setup script
├── quick_start.sh          # Quick start script
└── DEPLOYMENT_GUIDE.md     # Complete setup guide
```

## 🌐 Deployment Architecture

- **Frontend**: Hosted on GitHub Pages (free)
- **Backend API**: Running on your local machine
- **Database**: PostgreSQL on your local machine
- **Access**: Frontend makes API calls to your local server

## 📊 Database Schema

### Stock Table
```sql
- id (Primary Key)
- product_name (VARCHAR)
- company_name (VARCHAR)
- quantity (INTEGER)
- date_added (TIMESTAMP)
```

### Sales Table
```sql
- id (Primary Key)
- product_name (VARCHAR)
- company_name (VARCHAR)
- quantity_sold (INTEGER)
- customer_name (VARCHAR)
- sale_amount (DECIMAL)
- sale_date (TIMESTAMP)
```

## 🔧 Configuration

### Backend (.env)
```env
POSTGRES_USER=sri_lakshmi_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sri_lakshmi_db
```

### Frontend (config.js)
```javascript
PRODUCTION_API_URL: 'http://YOUR_LOCAL_IP:5000/api'
```

## 📱 Access Points

- **Local Development**: `file://path/to/frontend_simple/index.html`
- **GitHub Pages**: `https://your-username.github.io/projectstock`
- **API Server**: `http://localhost:5000` or `http://YOUR_IP:5000`

## 🎯 Key Features

### 🌾 Agricultural Theme
- Farm-inspired color scheme
- Wheat and tractor icons
- Natural, organic design elements
- Professional farming aesthetics

### 📦 Inventory Management
- Add products with company details
- Real-time stock tracking
- Low stock alerts
- Search and filter capabilities

### 💰 Sales Processing
- Product selection from available stock
- Automatic stock deduction
- Customer information recording
- Professional PDF receipts

### 📊 Analytics & Reports
- Dashboard with key metrics
- Weekly sales summaries
- PDF reports by customer/date
- Revenue tracking

## 🛡️ Security Features

- PostgreSQL database with user authentication
- CORS configuration for secure API access
- Environment-based configuration
- Secure password handling

## 📖 Documentation

- [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) - Complete setup instructions for any system
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Original deployment guide
- [API Documentation](#api-endpoints) - API endpoint details
- [Database Schema](#database-schema) - Database structure

## 📁 Setup Scripts

### Windows:
- `setup_windows.bat` - Initial setup for Windows
- `setup_database_windows.bat` - Database setup for Windows
- `start_server_windows.bat` - Start server on Windows

### Linux/Ubuntu:
- `setup_linux.sh` - Initial setup for Linux
- `setup_database_linux.sh` - Database setup for Linux
- `start_server_linux.sh` - Start server on Linux

### macOS:
- `setup_database.sh` - Database setup for macOS
- `quick_start.sh` - Quick start for macOS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with farming theme consistency
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for SRI LAKSHMI ENTERPRISES.

## 🌾 Perfect For

- Agricultural supply stores
- Farm equipment dealers
- Seed and fertilizer companies
- Rural cooperatives
- Any business wanting a natural, earthy feel

---

**🎉 Ready to manage your agricultural inventory with style!** 🚜🌱
