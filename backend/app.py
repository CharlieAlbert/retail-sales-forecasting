from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

DATA_PATH = "data/sales.csv"


@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Retail Sales Forecasting API"})


@app.route("/sales")
def sales_data():
    try:
        df = pd.read_csv(DATA_PATH, encoding="latin1", parse_dates=["Order Date"])
        df["Month"] = df["Order Date"].dt.to_period("M")
        monthly_sales = df.groupby("Month")["Sales"].sum().reset_index()
        monthly_sales["Month"] = monthly_sales["Month"].astype(str)
        result = monthly_sales.to_dict(orient="records")
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/forecast")
def forecast():
    try:
        df = pd.read_csv(DATA_PATH, encoding="latin1", parse_dates=["Order Date"])
        df["Month"] = df["Order Date"].dt.to_period("M")
        monthly_sales = df.groupby("Month")["Sales"].sum()

        last_3 = monthly_sales.tail(3)
        last_3.index = last_3.index.astype(str)
        forecast_value = round(last_3.mean(), 2)

        return jsonify(
            {
                "forecast": forecast_value,
                "method": "3-month moving average",
                "last_3_months": last_3.to_dict(),
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
