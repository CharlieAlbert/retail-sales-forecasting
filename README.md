# 📊 Sales Forecasting Dashboard

A modern, professional sales forecasting application built with React, TypeScript, and Flask. Provides powerful visualization and predictive analytics for retail sales data with an intuitive, executive-level interface.

## ✨ Features

- **Real-time Sales Analytics**: Interactive charts displaying historical sales performance
- **Predictive Forecasting**: 3-month moving average forecasting algorithm
- **Executive Dashboard**: Professional interface with key performance indicators
- **Interactive Visualizations**: Multiple chart types with hover tooltips and animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🏗 **Tech Stack**

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts  
**Backend:** Flask, Pandas, CSV data processing

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip

### Frontend Setup

1. **Create and setup React project**
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   npm add tailwindcss @tailwindcss/vite recharts
   npm add -D @types/node
   ```

2. **Install UI components**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add card badge button alert
   ```

3. **Configure Tailwind CSS**
   
   Replace `src/index.css`:
   ```css
   @import "tailwindcss";
   ```

   Update `vite.config.ts` for path aliases and Tailwind integration.

4. **Start development**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Setup Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install flask flask-cors pandas
   ```

2. **Create Flask app** with CORS enabled and two main endpoints:
   - `/sales` - Returns monthly sales data
   - `/forecast` - Returns 3-month moving average forecast

3. **Add your sales CSV data** with `Order Date` and `Sales` columns

4. **Start server**
   ```bash
   python app.py
   ```

## 📁 **Project Structure**

```
sales-forecasting-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── SalesChart.tsx   # Sales visualization
│   │   │   ├── ForecastChart.tsx # Forecast visualization
│   │   │   └── Dashboard.tsx    # Main dashboard
│   │   └── api/service.ts       # API functions
│   └── [config files]
├── backend/
│   ├── data/sales.csv          # Sales data
│   └── app.py                  # Flask application
└── README.md
```

## 🔌 **API Endpoints**

| Endpoint | Description | Response |
|----------|-------------|----------|
| `/` | Health check | `{"message": "Welcome..."}` |
| `/sales` | Monthly sales data | `[{"Month": "2024-01", "Sales": 125000}, ...]` |
| `/forecast` | Sales forecast | `{"forecast": 145000, "method": "3-month moving average", ...}` |

## 🎯 **Key Components**

- **SalesChart**: Historical sales visualization with area/line chart variants
- **ForecastChart**: Combined historical and forecast data display  
- **Dashboard**: Executive interface with KPIs, charts, and insights panel

## 🎨 **Key Metrics**

- Total Sales Revenue
- Monthly Growth Rate  
- Next Month Forecast
- Forecast vs Historical Average
- Method Performance Accuracy

## 🐛 **Troubleshooting**

**CORS Issues**: Install `flask-cors` and add `CORS(app)` to Flask app

**TypeScript Errors**: Ensure path aliases are configured in `tsconfig.json`

**Build Issues**: Clear cache with `rm -rf node_modules package-lock.json && npm install`

## 🔧 **Customization**

- **Charts**: Add new Recharts components and chart type selectors
- **API**: Extend Flask routes and update TypeScript types
- **Styling**: Modify Tailwind classes and shadcn/ui themes
- **Data**: Support additional CSV formats and data sources

## 📄 **License**

MIT License

---