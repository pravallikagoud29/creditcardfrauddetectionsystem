"""
Credit Card Fraud Detection - Prediction Module
================================================

This module loads the saved model (produced by train_model.py) and provides
functions to predict whether a single transaction or a batch of transactions
are fraudulent.

It can also run as a standalone script to predict from a CSV file.

Author: Data Science Internship
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_detection_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

FEATURE_COLUMNS = (
    ["Time"]
    + [f"V{i}" for i in range(1, 29)]
    + ["Amount"]
)


def load_model():
    """Load the trained model and scaler from disk."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. "
            "Run train_model.py first to generate the model."
        )
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Scaler file not found at {SCALER_PATH}. "
            "Run train_model.py first to generate the scaler."
        )
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    return model, scaler


def predict_transaction(transaction: dict, model=None, scaler=None) -> dict:
    """
    Predict whether a single transaction is fraudulent.

    Parameters
    ----------
    transaction : dict
        Dictionary with keys: Time, V1..V28, Amount.

    Returns
    -------
    dict
        {
            "prediction": 0 or 1,
            "prediction_label": "Legitimate" or "Fraudulent",
            "fraud_probability": float,
            "risk_level": "Low Risk" | "Medium Risk" | "High Risk",
        }
    """
    if model is None or scaler is None:
        model, scaler = load_model()

    # Build feature vector in the correct order
    features = np.array([[transaction.get(col, 0.0) for col in FEATURE_COLUMNS]])

    # Scale features
    features_scaled = scaler.transform(features)

    # Predict
    prediction = int(model.predict(features_scaled)[0])
    if hasattr(model, "predict_proba"):
        fraud_prob = float(model.predict_proba(features_scaled)[0, 1])
    else:
        fraud_prob = float(prediction)

    # Risk level
    if fraud_prob < 0.3:
        risk_level = "Low Risk"
    elif fraud_prob < 0.7:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"

    return {
        "prediction": prediction,
        "prediction_label": "Fraudulent" if prediction == 1 else "Legitimate",
        "fraud_probability": round(fraud_prob, 4),
        "risk_level": risk_level,
    }


def predict_batch(csv_path: str, model=None, scaler=None) -> pd.DataFrame:
    """
    Predict fraud for a batch of transactions from a CSV file.

    Parameters
    ----------
    csv_path : str
        Path to a CSV file with the same columns as sample_transactions.csv.

    Returns
    -------
    pd.DataFrame
        Original data with added columns: Prediction, FraudProbability, RiskLevel.
    """
    if model is None or scaler is None:
        model, scaler = load_model()

    df = pd.read_csv(csv_path)

    # Ensure all expected columns exist
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0.0

    X = df[FEATURE_COLUMNS].values
    X_scaled = scaler.transform(X)

    predictions = model.predict(X_scaled)
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(X_scaled)[:, 1]
    else:
        probabilities = predictions.astype(float)

    df["Prediction"] = predictions
    df["PredictionLabel"] = df["Prediction"].map({0: "Legitimate", 1: "Fraudulent"})
    df["FraudProbability"] = np.round(probabilities, 4)

    def _risk(p):
        if p < 0.3:
            return "Low Risk"
        elif p < 0.7:
            return "Medium Risk"
        else:
            return "High Risk"

    df["RiskLevel"] = df["FraudProbability"].apply(_risk)

    return df


def main():
    """Run batch prediction from the command line."""
    if len(sys.argv) < 2:
        print("Usage: python fraud_detection.py <csv_file> [output_csv]")
        print("Example: python fraud_detection.py sample_transactions.csv predictions.csv")
        sys.exit(1)

    csv_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "predictions_output.csv"

    print("=" * 60)
    print("  CREDIT CARD FRAUD DETECTION — BATCH PREDICTION")
    print("=" * 60)

    results = predict_batch(csv_path)

    # Summary
    total = len(results)
    legitimate = (results["Prediction"] == 0).sum()
    fraudulent = (results["Prediction"] == 1).sum()
    fraud_pct = (fraudulent / total) * 100 if total > 0 else 0

    print(f"\nTotal transactions : {total}")
    print(f"Legitimate         : {legitimate}")
    print(f"Fraudulent         : {fraudulent}")
    print(f"Fraud percentage    : {fraud_pct:.2f}%")

    # Save results
    output_full = os.path.join(os.path.dirname(__file__), output_path)
    results.to_csv(output_full, index=False)
    print(f"\nPredictions saved to: {output_full}")


if __name__ == "__main__":
    main()
