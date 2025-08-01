
# 📊 Sales Forecasting Dashboard

A modern, professional sales forecasting application built with **React**, **TypeScript**, and **Flask**. It delivers powerful visual analytics and predictive modeling for retail sales, offering a sleek executive-level interface.

---

## ✨ Features

- 📈 **Real-time Sales Analytics** – Interactive visualizations with KPIs  
- 🤖 **Predictive Forecasting** – Uses both **moving average** and **linear regression**  
- 🧠 **Insight Engine** – Auto-summarized trends and key business takeaways  
- 🖼️ **Modern Dashboard UI** – Responsive, executive-styled layout  
- 📤 **CSV Uploads** – Supports your own data file for personalized forecasting

---

## 🏗 Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Nivo  
**Backend:** Flask, Pandas, Scikit-learn (for regression), CSV processing

---

## 🚧 Prerequisites

| Tool       | Install Link |
|------------|--------------|
| 🟢 Node.js | [https://nodejs.org/en/download](https://nodejs.org/en/download) |
| 🐍 Python  | [https://www.python.org/downloads/](https://www.python.org/downloads/) |

---

## ⚙️ Project Setup

### 1️⃣ Backend (Flask + Python)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors pandas scikit-learn
```

📂 Add your sales data:  
Place your `sales.csv` in the `backend/data/` folder (must have `Order Date` and `Sales` columns)

🚀 Run the server:
```bash
python app.py
```

---

### 2️⃣ Frontend (React + Vite + Tailwind + shadcn)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install
```

🌐 Run the frontend:
```bash
npm run dev
```

---

## 🔌 API Endpoints

| Endpoint     | Description                    | Response Example |
|--------------|--------------------------------|------------------|
| `/`          | Health check                   | `{ "message": "Welcome..." }` |
| `/sales`     | Monthly sales breakdown        | `[ { "Month": "2024-01", "Sales": 125000 }, ... ]` |
| `/forecast`  | Forecast using 2 methods       |  
```json
{
  "forecast_period": "next_month",
  "data_source": "uploaded",
  "last_3_months": {
    "2024-04": 100200,
    "2024-05": 111100,
    "2024-06": 95000
  },
  "methods": {
    "3_month_moving_average": 102100.0,
    "linear_regression": 108580.5
  }
}
```

---

## 🧱 Project Structure

```
sales-forecasting-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn components
│   │   │   ├── charts/                # Chart components (Recharts & Nivo)
│   │   │   ├── SalesChart.tsx
│   │   │   ├── ForecastChart.tsx
│   │   └── pages/
│   │       ├── OverviewPage.tsx
│   │       ├── InsightsPage.tsx
│   │       └── UploadPage.tsx
│   └── ...
├── backend/
│   ├── data/sales.csv                # Your data file
│   └── app.py                        # Flask app with endpoints
└── README.md
```

---

## 📊 Key Components

- **SalesChart** – Historical monthly sales trends  
- **ForecastChart** – Future sales projection using 2 methods  
- **ProfitTrendChart** – Tracks monthly profit gains/losses  
- **CategorySalesChart** – Breakdown of sales by category  
- **UploadPage** – Allows uploading your own CSV dataset  

---

## 📈 Key Metrics

- 📦 Total Sales Revenue  
- 📈 Monthly Growth Rate  
- 📊 Forecasted Next Month  
- ⚙️ Forecast Accuracy (moving average vs regression)  
- 📉 Profit Performance and Trends  

---

## 🧠 Insight Engine

- Top categories by revenue
- Profitability trend (up/down %)
- Month-over-month performance
- Forecast bias detection (moving avg vs regression)

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| **CORS errors** | Make sure `flask-cors` is installed and use `CORS(app)` in Flask |
| **CSV not working** | Ensure `Order Date` and `Sales` columns exist and dates are parseable |
| **Tailwind not working** | Check your `tailwind.config.js` and make sure CSS is imported in `main.tsx` |
| **Forecast error** | Ensure your data has at least 3 complete months of sales |

---

## 🔧 Customization Tips

- Use **Nivo** or **Recharts** for advanced data storytelling  
- Add more forecasting models (e.g., exponential smoothing, Prophet)  
- Use a database (e.g., PostgreSQL) to store uploaded datasets  
- Export PDF/CSV summaries from dashboard views

---

## 📜 License

MIT License  
© 2025 CharlieAlbert

---

## 🙌 Contributing

PRs and suggestions are welcome.
