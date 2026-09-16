"""
Credit Card Fraud Detection - Model Training
=============================================

This script trains two machine learning models (Logistic Regression and
Random Forest) to detect fraudulent credit card transactions.

It performs the full pipeline:
  1. Load the sample dataset (sample_transactions.csv)
  2. Clean the data and check for missing values
  3. Separate features (X) and target (y)  -- target column is "Class"
  4. Split into training and test sets
  5. Apply SMOTE to handle class imbalance
  6. Train Logistic Regression
  7. Train Random Forest Classifier
  8. Evaluate both models (Accuracy, Precision, Recall, F1, ROC-AUC)
  9. Generate and display a confusion matrix
 10. Save the best model with joblib

Usage:
    python train_model.py

Author: Data Science Internship
"""

import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)

from imblearn.over_sampling import SMOTE


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "sample_transactions.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
RANDOM_STATE = 42


def load_data(path: str) -> pd.DataFrame:
    """Load the CSV dataset using Pandas."""
    print("=" * 60)
    print("STEP 1: Loading dataset")
    print("=" * 60)
    df = pd.read_csv(path)
    print(f"Dataset loaded: {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the data and check for missing values."""
    print("\n" + "=" * 60)
    print("STEP 2: Cleaning data")
    print("=" * 60)

    duplicates = df.duplicated().sum()
    if duplicates > 0:
        print(f"Found {duplicates} duplicate rows - removing them.")
        df = df.drop_duplicates().reset_index(drop=True)
    else:
        print("No duplicate rows found.")

    missing = df.isnull().sum()
    total_missing = missing.sum()
    if total_missing > 0:
        print(f"Found {total_missing} missing values - filling with column mean.")
        df = df.fillna(df.mean())
    else:
        print("No missing values found.")

    print(f"Dataset shape after cleaning: {df.shape}")
    return df


def separate_features_target(df: pd.DataFrame):
    """Separate features (X) and target (y). Target column is 'Class'."""
    print("\n" + "=" * 60)
    print("STEP 3: Separating features and target")
    print("=" * 60)

    if "Class" not in df.columns:
        raise ValueError("Target column 'Class' not found in dataset.")

    X = df.drop(columns=["Class"])
    y = df["Class"]

    print(f"Features (X): {X.shape[0]} samples, {X.shape[1]} features")
    print(f"Target (y): {y.shape[0]} samples")
    print(f"  - Legitimate (0): {(y == 0).sum()}")
    print(f"  - Fraudulent (1): {(y == 1).sum()}")
    print(f"  - Fraud percentage: {((y == 1).sum() / len(y)) * 100:.2f}%")

    return X, y


def split_and_balance(X, y):
    """Split the dataset and apply SMOTE to handle class imbalance."""
    print("\n" + "=" * 60)
    print("STEP 4: Splitting dataset (train_test_split)")
    print("=" * 60)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=RANDOM_STATE, stratify=y
    )

    print(f"Training set: {X_train.shape[0]} samples")
    print(f"  - Legitimate: {(y_train == 0).sum()}")
    print(f"  - Fraudulent: {(y_train == 1).sum()}")
    print(f"Test set: {X_test.shape[0]} samples")
    print(f"  - Legitimate: {(y_test == 0).sum()}")
    print(f"  - Fraudulent: {(y_test == 1).sum()}")

    print("\nScaling features with StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\n" + "=" * 60)
    print("STEP 5: Handling class imbalance with SMOTE")
    print("=" * 60)

    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)

    print(f"Before SMOTE - Legitimate: {(y_train == 0).sum()}, Fraudulent: {(y_train == 1).sum()}")
    print(f"After SMOTE  - Legitimate: {(y_train_balanced == 0).sum()}, Fraudulent: {(y_train_balanced == 1).sum()}")

    return X_train_balanced, X_test_scaled, y_train_balanced, y_test, scaler


def train_logistic_regression(X_train, y_train):
    """Train a Logistic Regression model."""
    print("\n" + "=" * 60)
    print("STEP 6: Training Logistic Regression")
    print("=" * 60)

    model = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
    model.fit(X_train, y_train)
    print("Logistic Regression trained successfully.")
    return model


def train_random_forest(X_train, y_train):
    """Train a Random Forest Classifier."""
    print("\n" + "=" * 60)
    print("STEP 7: Training Random Forest Classifier")
    print("=" * 60)

    model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=RANDOM_STATE, n_jobs=-1
    )
    model.fit(X_train, y_train)
    print("Random Forest trained successfully.")
    return model


def evaluate_model(name: str, model, X_test, y_test):
    """Evaluate a model and return its metrics."""
    print(f"\n{'=' * 60}")
    print(f"STEP 8: Evaluating {name}")
    print("=" * 60)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba) if len(np.unique(y_test)) > 1 else 0.0

    cm = confusion_matrix(y_test, y_pred)

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")
    print(f"\nConfusion Matrix:\n{cm}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred, zero_division=0)}")

    return {
        "name": name,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "roc_auc": roc_auc,
        "confusion_matrix": cm,
        "y_pred": y_pred,
        "y_proba": y_proba,
    }


def compare_models(metrics_list):
    """Compare the trained models and pick the best one."""
    print("\n" + "=" * 60)
    print("STEP 9: Comparing models")
    print("=" * 60)

    comparison = pd.DataFrame(metrics_list).set_index("name")
    display_cols = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    print(comparison[display_cols].to_string())

    best = max(metrics_list, key=lambda m: m["f1"])
    print(f"\nBest model by F1 Score: {best['name']} (F1={best['f1']:.4f})")
    return best


def save_model(model, scaler, name: str):
    """Save the trained model and scaler using joblib."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, f"{name}.joblib")
    scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"\nModel saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    return model_path


def main():
    print("=" * 60)
    print("  CREDIT CARD FRAUD DETECTION - MODEL TRAINING")
    print("=" * 60)

    # 1. Load data
    df = load_data(DATA_PATH)

    # 2. Clean data
    df = clean_data(df)

    # 3. Separate features and target
    X, y = separate_features_target(df)

    # 4-5. Split and balance
    X_train, X_test, y_train, y_test, scaler = split_and_balance(X, y)

    # 6. Train Logistic Regression
    lr_model = train_logistic_regression(X_train, y_train)

    # 7. Train Random Forest
    rf_model = train_random_forest(X_train, y_train)

    # 8. Evaluate both models
    lr_metrics = evaluate_model("Logistic Regression", lr_model, X_test, y_test)
    rf_metrics = evaluate_model("Random Forest", rf_model, X_test, y_test)

    # 9. Compare models
    metrics_list = [
        {k: v for k, v in lr_metrics.items() if k not in ("y_pred", "y_proba", "confusion_matrix")},
        {k: v for k, v in rf_metrics.items() if k not in ("y_pred", "y_proba", "confusion_matrix")},
    ]
    best = compare_models(metrics_list)

    # 10. Save the best model
    best_model = lr_model if best["name"] == "Logistic Regression" else rf_model
    save_model(best_model, scaler, "fraud_detection_model")

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)
    print(f"Best model: {best['name']}")
    print(f"  Accuracy : {best['accuracy']:.4f}")
    print(f"  Precision: {best['precision']:.4f}")
    print(f"  Recall   : {best['recall']:.4f}")
    print(f"  F1 Score : {best['f1']:.4f}")
    print(f"  ROC-AUC  : {best['roc_auc']:.4f}")


if __name__ == "__main__":
    main()
