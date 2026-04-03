import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def train_and_cache_model():
    df = pd.read_csv("ai4i2020.csv")
    # Cleans column names to: UDI, ProductID, Type, AirtemperatureK, etc.
    df.columns = df.columns.str.strip().str.replace(" ", "").str.replace("[^A-Za-z0-9_]", "", regex=True)

    le = LabelEncoder()
    df["ProductID"] = le.fit_transform(df["ProductID"])
    df["Type"] = le.fit_transform(df["Type"])

    X = df.drop("Machinefailure", axis=1)
    y = df["Machinefailure"]

    feature_stats = {
        col: {
            "mean": round(float(X[col].mean()), 4),
            "min": round(float(X[col].min()), 4),
            "max": round(float(X[col].max()), 4),
        }
        for col in X.columns
    }

    feature_columns = X.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    dtrain = xgb.DMatrix(X_train, label=y_train)
    params = {
        "objective": "binary:logistic",
        "max_depth": 3,
        "eta": 0.3,
        "eval_metric": "logloss",
        "seed": 42,
    }
    model = xgb.train(params, dtrain, num_boost_round=20)

    dtest = xgb.DMatrix(X_test)
    raw_preds = model.predict(dtest)
    preds = (raw_preds > 0.5).astype(int)

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, preds)), 4),
        "precision": round(float(precision_score(y_test, preds, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, preds, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, preds, zero_division=0)), 4),
        "total_samples": len(df),
        "failure_rate": round(float(y.mean()), 4),
    }

    return model, feature_columns, feature_stats, metrics


def predict_failure(model, feature_columns, input_data):
    """
    Takes the 13-column mapped dictionary from app.py, formats it for XGBoost,
    and returns the prediction.
    """
    # 1. Map 'Type' (L, M, H) to numbers (0, 1, 2) matching LabelEncoder
    type_map = {'L': 0, 'M': 1, 'H': 2}
    if 'Type' in input_data and isinstance(input_data['Type'], str):
        input_data['Type'] = type_map.get(input_data['Type'], 0)

    # 2. Convert dictionary into a Pandas DataFrame using exact feature_columns order
    df_input = pd.DataFrame([input_data], columns=feature_columns)
    
    # Ensure all data is numeric to prevent XGBoost errors
    df_input = df_input.apply(pd.to_numeric, errors='coerce').fillna(0)

    # 3. Convert DataFrame to XGBoost DMatrix
    dtest = xgb.DMatrix(df_input)
    
    # 4. Predict
    raw_prediction = model.predict(dtest)[0]
    prediction = int(raw_prediction > 0.5)
    
    return {"prediction": prediction}