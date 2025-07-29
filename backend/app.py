from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename
import chardet
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variable to store current dataset info
current_dataset = {
    "filename": None,
    "filepath": None,
    "columns": [],
    "date_column": None,
    "sales_column": None,
    "upload_time": None,
    "row_count": 0,
}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def detect_date_columns(df):
    """Automatically detect potential date columns"""
    date_columns = []
    for col in df.columns:
        # Check if column name suggests it's a date
        if any(
            keyword in col.lower()
            for keyword in ["date", "time", "day", "month", "year"]
        ):
            date_columns.append(col)
        # Try to parse first few values as dates
        else:
            try:
                pd.to_datetime(df[col].dropna().head(5))
                date_columns.append(col)
            except:
                continue
    return date_columns


def detect_sales_columns(df):
    """Automatically detect potential sales/numeric columns"""
    sales_columns = []
    for col in df.columns:
        # Check if column name suggests it's sales/revenue
        if any(
            keyword in col.lower()
            for keyword in ["sales", "revenue", "amount", "price", "total", "value"]
        ):
            # Verify it's numeric
            if pd.api.types.is_numeric_dtype(df[col]) or df[col].dtype == "object":
                try:
                    pd.to_numeric(df[col].str.replace("[^0-9.-]", "", regex=True))
                    sales_columns.append(col)
                except:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        sales_columns.append(col)
    return sales_columns

def process_uploaded_data(filepath, date_column, sales_column):
    """Process the uploaded CSV and return monthly aggregated data"""
    try:
        # Read the file based on extension
        if filepath.endswith(".csv"):
            df = pd.read_csv(filepath, encoding="utf-8")
        else:
            df = pd.read_excel(filepath)

        # Convert date column to datetime
        df[date_column] = pd.to_datetime(df[date_column])

        # Clean and convert sales column to numeric
        if df[sales_column].dtype == "object":
            # Remove currency symbols and convert to numeric
            df[sales_column] = pd.to_numeric(
                df[sales_column].astype(str).str.replace("[^0-9.-]", "", regex=True),
                errors="coerce",
            )

        # Remove rows with invalid data
        df = df.dropna(subset=[date_column, sales_column])

        # Create monthly periods and aggregate
        df["Month"] = df[date_column].dt.to_period("M")
        monthly_sales = df.groupby("Month")[sales_column].sum().reset_index()
        monthly_sales["Month"] = monthly_sales["Month"].astype(str)
        monthly_sales = monthly_sales.rename(columns={sales_column: "Sales"})

        return monthly_sales.to_dict(orient="records")

    except Exception as e:
        raise Exception(f"Error processing data: {str(e)}")


def detect_encoding(filepath):
    with open(filepath, "rb") as f:
        result = chardet.detect(f.read(10000))
    return result["encoding"]


@app.route("/")
def home():
    return jsonify(
        {
            "message": "Welcome to the Retail Sales Forecasting API",
            "version": "2.0",
            "features": ["file_upload", "dynamic_forecasting", "column_detection"],
        }
    )


@app.route("/upload", methods=["POST"])
def upload_file():
    """Handle file upload and return column information"""
    try:
        # Check if file is in request
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return (
                jsonify(
                    {
                        "error": "File type not allowed. Please upload CSV, XLS, or XLSX files"
                    }
                ),
                400,
            )

        # Generate unique filename to prevent conflicts
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)

        # Save the file
        file.save(filepath)

        # Read and analyze the file
        try:
            if filename.endswith(".csv"):
                encoding = detect_encoding(filepath)
                print(encoding)
                df = pd.read_csv(filepath, encoding=encoding or "latin1")
            else:
                df = pd.read_excel(filepath)
        except UnicodeDecodeError:
            # Try different encodings for CSV
            df = pd.read_csv(filepath, encoding="latin1")

        # Detect potential columns
        date_columns = detect_date_columns(df)
        sales_columns = detect_sales_columns(df)

        # Update global dataset info
        current_dataset.update(
            {
                "filename": filename,
                "filepath": filepath,
                "columns": df.columns.tolist(),
                "date_columns": date_columns,
                "sales_columns": sales_columns,
                "upload_time": datetime.now().isoformat(),
                "row_count": len(df),
            }
        )

        return jsonify(
            {
                "message": "File uploaded successfully",
                "filename": filename,
                "columns": df.columns.tolist(),
                "date_columns": date_columns,
                "sales_columns": sales_columns,
                "row_count": len(df),
                "sample_data": df.head(3).to_dict(orient="records"),
            }
        )

    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@app.route("/configure", methods=["POST"])
def configure_columns():
    """Configure which columns to use for date and sales"""
    try:
        data = request.json
        date_column = data.get("date_column")
        sales_column = data.get("sales_column")

        if not date_column or not sales_column:
            return (
                jsonify({"error": "Both date_column and sales_column are required"}),
                400,
            )

        if not current_dataset["filepath"]:
            return (
                jsonify({"error": "No file uploaded. Please upload a file first"}),
                400,
            )

        # Update configuration
        current_dataset.update(
            {"date_column": date_column, "sales_column": sales_column}
        )

        # Process the data with selected columns
        processed_data = process_uploaded_data(
            current_dataset["filepath"], date_column, sales_column
        )

        return jsonify(
            {
                "message": "Configuration saved successfully",
                "date_column": date_column,
                "sales_column": sales_column,
                "processed_records": len(processed_data),
                "date_range": {
                    "start": processed_data[0]["Month"] if processed_data else None,
                    "end": processed_data[-1]["Month"] if processed_data else None,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": f"Configuration failed: {str(e)}"}), 500

@app.route("/sales")
def sales_data():
    """Get sales data from uploaded file or default data"""
    try:
        # Check if user has uploaded and configured data
        if (
            current_dataset["filepath"]
            and current_dataset["date_column"]
            and current_dataset["sales_column"]
        ):
            # Use uploaded data
            result = process_uploaded_data(
                current_dataset["filepath"],
                current_dataset["date_column"],
                current_dataset["sales_column"],
            )
            return jsonify(result)
        else:
            # Fallback to default data if available
            DEFAULT_DATA_PATH = "data/sales.csv"
            if os.path.exists(DEFAULT_DATA_PATH):
                df = pd.read_csv(
                    DEFAULT_DATA_PATH, encoding="latin1", parse_dates=["Order Date"]
                )
                df["Month"] = df["Order Date"].dt.to_period("M")
                monthly_sales = df.groupby("Month")["Sales"].sum().reset_index()
                monthly_sales["Month"] = monthly_sales["Month"].astype(str)
                result = monthly_sales.to_dict(orient="records")
                return jsonify(result)
            else:
                return (
                    jsonify({"error": "No data available. Please upload a file first"}),
                    404,
                )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/forecast")
def forecast():
    """Generate forecast from uploaded data or default data using regression and moving averages"""
    try:
        # Get sales data (will use uploaded data if configured)
        sales_response = sales_data()
        if hasattr(sales_response, "status_code") and sales_response.status_code != 200:
            return sales_response
        
        # Extract data from sales response
        if hasattr(sales_response, "get_json"):
            sales_data_list = sales_response.get_json()
        else:
            sales_data_list = sales_response
            
        if not sales_data_list or len(sales_data_list) < 3:
            return (
                jsonify(
                    {
                        "error": "Insufficient data for forecasting. Need at least 3 months of data"
                    }
                ),
                400,
            )
        
        # Convert to pandas DataFrame for analysis
        df = pd.DataFrame(sales_data_list)
        
        # Ensure Month column is datetime and sort by date
        df['Month'] = pd.to_datetime(df['Month'])
        df = df.sort_values('Month')
        
        # Create numeric index for regression (0, 1, 2, ...)
        df['period_index'] = range(len(df))
        
        # Extract sales values
        sales_values = df['Sales'].values
        period_indices = df['period_index'].values
        
        # Method 1: Linear Regression Forecast
        from sklearn.linear_model import LinearRegression
        
        # Fit linear regression model
        X = period_indices.reshape(-1, 1)
        y = sales_values
        
        reg_model = LinearRegression()
        reg_model.fit(X, y)
        
        # Predict next period (current max index + 1)
        next_period = len(df)
        regression_forecast = reg_model.predict([[next_period]])[0]
        
        # Method 2: Moving Average Forecasts
        last_3_sales = sales_values[-3:]
        moving_avg_3 = np.mean(last_3_sales)
        
        # If we have enough data, also calculate 6-month moving average
        if len(sales_values) >= 6:
            last_6_sales = sales_values[-6:]
            moving_avg_6 = np.mean(last_6_sales)
        else:
            moving_avg_6 = moving_avg_3
        
        # Method 3: Weighted Moving Average (more recent months have higher weight)
        if len(sales_values) >= 3:
            weights = np.array([1, 2, 3])  # Most recent month gets highest weight
            weighted_avg = np.average(last_3_sales, weights=weights)
        else:
            weighted_avg = moving_avg_3
        
        # Combine forecasts using ensemble approach
        # Weight: 40% regression, 30% 3-month MA, 20% weighted MA, 10% 6-month MA
        ensemble_forecast = (
            0.4 * regression_forecast +
            0.3 * moving_avg_3 +
            0.2 * weighted_avg +
            0.1 * moving_avg_6
        )
        
        # Calculate trend and seasonality metrics
        # Linear trend slope
        trend_slope = reg_model.coef_[0]
        trend_direction = "increasing" if trend_slope > 0 else "decreasing" if trend_slope < 0 else "stable"
        
        # R-squared for regression quality
        from sklearn.metrics import r2_score
        regression_r2 = r2_score(y, reg_model.predict(X))
        
        # Prepare last 3 months data for frontend
        last_3_months = {}
        for i in range(min(3, len(df))):
            month_data = df.iloc[-(3-i)]
            month_key = month_data['Month'].strftime('%Y-%m')
            last_3_months[month_key] = float(month_data['Sales'])
        
        # Calculate confidence metrics
        recent_volatility = np.std(last_3_sales) if len(last_3_sales) > 1 else 0
        confidence_level = "high" if recent_volatility < np.mean(last_3_sales) * 0.2 else "medium" if recent_volatility < np.mean(last_3_sales) * 0.4 else "low"
        
        return jsonify({
            "forecast": round(ensemble_forecast, 2),
            "method": "Ensemble (Regression + Moving Averages)",
            "forecast_components": {
                "linear_regression": round(regression_forecast, 2),
                "moving_avg_3": round(moving_avg_3, 2),
                "moving_avg_6": round(moving_avg_6, 2),
                "weighted_avg": round(weighted_avg, 2)
            },
            "trend_analysis": {
                "slope": round(trend_slope, 2),
                "direction": trend_direction,
                "r_squared": round(regression_r2, 3)
            },
            "confidence_metrics": {
                "level": confidence_level,
                "volatility": round(recent_volatility, 2)
            },
            "last_3_months": last_3_months,
            "data_source": "uploaded" if current_dataset["filepath"] else "default",
            "forecast_period": "next_month",
        })
        
    except Exception as e:
        # Log the full error for debugging
        print(f"Forecast error: {str(e)}")
        return jsonify({"error": f"Forecasting failed: {str(e)}"}), 500

@app.route("/dataset/info")
def dataset_info():
    """Get information about the current dataset"""
    return jsonify(
        {
            "current_dataset": current_dataset,
            "has_uploaded_data": bool(current_dataset["filepath"]),
            "is_configured": bool(
                current_dataset["date_column"] and current_dataset["sales_column"]
            ),
        }
    )


@app.route("/dataset/reset", methods=["POST"])
def reset_dataset():
    """Reset/clear the current dataset"""
    try:
        # Remove uploaded file if exists
        if current_dataset["filepath"] and os.path.exists(current_dataset["filepath"]):
            os.remove(current_dataset["filepath"])

        # Reset global dataset info
        current_dataset.update(
            {
                "filename": None,
                "filepath": None,
                "columns": [],
                "date_column": None,
                "sales_column": None,
                "upload_time": None,
                "row_count": 0,
            }
        )

        return jsonify({"message": "Dataset reset successfully"})

    except Exception as e:
        return jsonify({"error": f"Reset failed: {str(e)}"}), 500


@app.route("/category-sales")
def category_sales():
    try:
        if (
            current_dataset["filepath"]
            and current_dataset["date_column"]
            and current_dataset["sales_column"]
        ):
            if current_dataset["filepath"].endswith(".csv"):
                df = pd.read_csv(current_dataset["filepath"], encoding="utf-8")
            else:
                df = pd.read_excel(current_dataset["filepath"])
        else:
            DEFAULT_DATA_PATH = "data/sales.csv"
            if os.path.exists(DEFAULT_DATA_PATH):
                df = pd.read_csv(DEFAULT_DATA_PATH, encoding="latin1")
            else:
                return jsonify({"error": "No data available"}), 404
            
        sales_column = current_dataset["sales_column"] or "Sales"
        if df[sales_column].dtype == "object":
            df[sales_column] = pd.to_numeric(
                df[sales_column].astype(str).str.replace(r"[^0-9.\-]", "", regex=True),
                errors="coerce"
            )

        # Dropping missing values
        df = df.dropna(subset=[sales_column, "Category"])

        result = (
            df.groupby("Category")[sales_column]
            .sum()
            .sort_values(ascending=False)
            .reset_index()
            .rename(columns={sales_column: "Sales"})
        )

        return jsonify(result.to_dict(orient="records"))

    except Exception as e:
        return jsonify({
            "error": f"category sales failed: {str(e)}",
        })

@app.route("/profit-trend")
def profit_trend():
    try:
        if (
            current_dataset["filepath"]
            and current_dataset["date_column"]
        ):
            if current_dataset["filepath"].endswith(".csv"):
                df = pd.read_csv(current_dataset["filepath"], encoding="utf-8")
            else:
                df = pd.read_excel(current_dataset["filepath"])
            date_col = current_dataset["date_column"]
        else:
            DEFAULT_DATA_PATH = "data/sales.csv"
            if os.path.exists(DEFAULT_DATA_PATH):
                df = pd.read_csv(DEFAULT_DATA_PATH, encoding="latin1")
                date_col = "Order Date"
            else:
                return jsonify({"error": "No data available"}), 404
        
        if "Profit" not in df.columns:
            return jsonify({"error": "Profit column not found in dataset"}), 404
        
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
        df = df.dropna(subset=[date_col, "Profit"])

        if df["Profit"].dtype == "object":
            df["Profit"] = pd.to_numeric(
                df["Profit"].astype(str).str.replace(r"[^0-9.\-]", "", regex=True),
                errors="coerce"
            )
        
        df["Month"] = df[date_col].dt.to_period("M").astype(str)
        result = df.groupby("Month")["Profit"].sum().reset_index()

        return jsonify(result.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": f"Profit trend failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
