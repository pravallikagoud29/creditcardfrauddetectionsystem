"""
Credit Card Fraud Detection System - Streamlit Web Application
==============================================================

A simple Streamlit interface that:
  - Displays the project title
  - Shows dataset information (total, legitimate, fraudulent)
  - Allows interactive transaction prediction
  - Displays prediction results and fraud probability

Usage:
    pip install -r requirements.txt
    streamlit run app.py

Author: Data Science Internship
"""

import os
import pandas as pd
import numpy as np
import streamlit as st

from fraud_detection import load_model, predict_transaction, FEATURE_COLUMNS


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "sample_transactions.csv")


@st.cache_data
def load_dataset():
    """Load and cache the sample dataset."""
    return pd.read_csv(DATA_PATH)


def show_dataset_info(df):
    """Display dataset information in the sidebar/main area."""
    st.subheader("Dataset Information")

    total = len(df)
    legitimate = int((df["Class"] == 0).sum())
    fraudulent = int((df["Class"] == 1).sum())
    fraud_pct = (fraudulent / total) * 100 if total > 0 else 0

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Transactions", f"{total:,}")
    col2.metric("Legitimate", f"{legitimate:,}")
    col3.metric("Fraudulent", f"{fraudulent:,}")

    st.write(f"**Fraud Percentage:** {fraud_pct:.2f}%")
    st.write(f"**Features:** {df.shape[1] - 1} (Time, V1-V28, Amount)")
    st.write(f"**Target Column:** Class (0 = Legitimate, 1 = Fraudulent)")

    st.dataframe(df.head(10), use_container_width=True)


def show_prediction_form():
    """Display the transaction prediction form."""
    st.subheader("Fraud Prediction")

    st.write("Enter the transaction feature values below:")

    col_a, col_b = st.columns(2)

    with col_a:
        time_val = st.number_input("Time (seconds)", value=0, step=1)
        amount = st.number_input("Amount", value=0.0, step=0.01, format="%.2f")
        v1 = st.number_input("V1", value=0.0, step=0.01, format="%.4f")
        v2 = st.number_input("V2", value=0.0, step=0.01, format="%.4f")
        v3 = st.number_input("V3", value=0.0, step=0.01, format="%.4f")
        v4 = st.number_input("V4", value=0.0, step=0.01, format="%.4f")
        v5 = st.number_input("V5", value=0.0, step=0.01, format="%.4f")
        v6 = st.number_input("V6", value=0.0, step=0.01, format="%.4f")

    with col_b:
        v7 = st.number_input("V7", value=0.0, step=0.01, format="%.4f")
        v8 = st.number_input("V8", value=0.0, step=0.01, format="%.4f")
        v9 = st.number_input("V9", value=0.0, step=0.01, format="%.4f")
        v10 = st.number_input("V10", value=0.0, step=0.01, format="%.4f")
        v11 = st.number_input("V11", value=0.0, step=0.01, format="%.4f")
        v12 = st.number_input("V12", value=0.0, step=0.01, format="%.4f")
        v13 = st.number_input("V13", value=0.0, step=0.01, format="%.4f")
        v14 = st.number_input("V14", value=0.0, step=0.01, format="%.4f")

    v15 = st.number_input("V15", value=0.0, step=0.01, format="%.4f")
    v16 = st.number_input("V16", value=0.0, step=0.01, format="%.4f")
    v17 = st.number_input("V17", value=0.0, step=0.01, format="%.4f")
    v18 = st.number_input("V18", value=0.0, step=0.01, format="%.4f")
    v19 = st.number_input("V19", value=0.0, step=0.01, format="%.4f")
    v20 = st.number_input("V20", value=0.0, step=0.01, format="%.4f")
    v21 = st.number_input("V21", value=0.0, step=0.01, format="%.4f")
    v22 = st.number_input("V22", value=0.0, step=0.01, format="%.4f")
    v23 = st.number_input("V23", value=0.0, step=0.01, format="%.4f")
    v24 = st.number_input("V24", value=0.0, step=0.01, format="%.4f")
    v25 = st.number_input("V25", value=0.0, step=0.01, format="%.4f")
    v26 = st.number_input("V26", value=0.0, step=0.01, format="%.4f")
    v27 = st.number_input("V27", value=0.0, step=0.01, format="%.4f")
    v28 = st.number_input("V28", value=0.0, step=0.01, format="%.4f")

    if st.button("Check Transaction", type="primary"):
        transaction = {
            "Time": float(time_val),
            "Amount": float(amount),
            "V1": float(v1), "V2": float(v2), "V3": float(v3), "V4": float(v4),
            "V5": float(v5), "V6": float(v6), "V7": float(v7), "V8": float(v8),
            "V9": float(v9), "V10": float(v10), "V11": float(v11), "V12": float(v12),
            "V13": float(v13), "V14": float(v14), "V15": float(v15), "V16": float(v16),
            "V17": float(v17), "V18": float(v18), "V19": float(v19), "V20": float(v20),
            "V21": float(v21), "V22": float(v22), "V23": float(v23), "V24": float(v24),
            "V25": float(v25), "V26": float(v26), "V27": float(v27), "V28": float(v28),
        }

        try:
            model, scaler = load_model()
            result = predict_transaction(transaction, model, scaler)

            st.markdown("---")
            st.subheader("Prediction Result")

            if result["prediction"] == 1:
                st.error(f"**{result['prediction_label']}**")
            else:
                st.success(f"**{result['prediction_label']}**")

            prob_pct = result["fraud_probability"] * 100
            st.write(f"**Fraud Probability:** {prob_pct:.2f}%")
            st.write(f"**Risk Level:** {result['risk_level']}")

            st.progress(float(result["fraud_probability"]))

        except FileNotFoundError:
            st.warning(
                "Model not found. Please run `python train_model.py` first "
                "to train and save the model."
            )


def main():
    st.set_page_config(
        page_title="Credit Card Fraud Detection",
        page_icon="💳",
        layout="wide",
    )

    st.title("Credit Card Fraud Detection System")
    st.write("Machine learning-powered detection of fraudulent transactions")

    st.markdown("---")

    df = load_dataset()

    show_dataset_info(df)

    st.markdown("---")

    show_prediction_form()

    st.markdown("---")
    st.caption("SecurePay Fraud Detection v1.0.0 | Data Science Internship Project")


if __name__ == "__main__":
    main()
