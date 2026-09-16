# Credit Card Fraud Detection System

## Project Title

**SecurePay Fraud Detection** — A machine learning-powered system that detects fraudulent credit card transactions in real time.

---

## Project Overview

This project implements a complete credit card fraud detection pipeline using machine learning. It combines a Python ML backend (for model training and prediction) with a professional React/TypeScript fintech dashboard that visualizes data, model performance, and allows interactive fraud prediction.

The system trains two models — **Logistic Regression** and **Random Forest** — on a credit card transaction dataset, handles class imbalance using **SMOTE**, and evaluates them with industry-standard metrics (Accuracy, Precision, Recall, F1 Score, ROC-AUC).

---

## Problem Statement

Credit card fraud is a major financial crime causing billions of dollars in losses annually. Financial institutions need automated systems that can instantly analyze transaction patterns and flag suspicious activity. The challenge is detecting fraud accurately while minimizing false alarms — a difficult task because fraudulent transactions are extremely rare compared to legitimate ones (typically less than 1% of all transactions).

---

## Objectives

1. Build a machine learning pipeline that classifies transactions as legitimate or fraudulent.
2. Handle the severe class imbalance in fraud datasets using SMOTE.
3. Train and compare two models: Logistic Regression and Random Forest.
4. Evaluate models using Accuracy, Precision, Recall, F1 Score, and ROC-AUC.
5. Provide an interactive web dashboard for fraud prediction and data analysis.
6. Support batch prediction on uploaded CSV files.

---

## Features

### Python ML Backend
- Data loading and cleaning with Pandas
- Missing value detection and handling
- Feature/target separation (target column: `Class`)
- Train/test split with stratification
- SMOTE for class imbalance handling
- Logistic Regression training
- Random Forest Classifier training
- Full model evaluation (5 metrics)
- Confusion matrix generation and visualization
- Model persistence with joblib
- Single-transaction and batch prediction

### React Frontend Dashboard
- **Dashboard** — Overview of total transactions, fraud statistics, and model metrics
- **Dataset Analysis** — Dataset preview, statistics, and legitimate vs. fraudulent chart
- **Fraud Prediction** — Interactive form to check individual transactions
- **Model Performance** — Side-by-side model comparison and confusion matrix visualization
- **Batch Prediction** — Upload CSV files for bulk analysis with downloadable results

---

## Technologies Used

| Category | Technologies |
|----------|-------------|
| **Machine Learning** | Python, Pandas, NumPy, Scikit-learn, imbalanced-learn (SMOTE) |
| **Model Serialization** | joblib |
| **Visualization (Python)** | Matplotlib, Seaborn |
| **Frontend** | React, TypeScript, Vite |
| **Styling** | CSS (custom design system) |
| **Icons** | Lucide React |

---

## Dataset Description

The project includes a sample dataset (`ml/sample_transactions.csv`) with 300 transactions (280 legitimate, 20 fraudulent). Each transaction has:

| Column | Description |
|--------|-------------|
| `Time` | Seconds elapsed since first transaction |
| `V1` – `V28` | Anonymized PCA-transformed features |
| `Amount` | Transaction amount |
| `Class` | Target variable — 0 = Legitimate, 1 = Fraudulent |

The dataset is generated deterministically so results are reproducible. Fraudulent transactions have higher amounts and wider feature-value spreads to simulate real fraud patterns.

---

## Data Preprocessing

1. **Loading**: The CSV is loaded into a Pandas DataFrame.
2. **Duplicate Removal**: Duplicate rows are identified and removed.
3. **Missing Value Check**: Missing values are detected and filled with column means.
4. **Feature/Target Separation**: Features (X) are separated from the target (y = `Class`).
5. **Train/Test Split**: Data is split 70/30 with stratification to maintain class proportions.
6. **Feature Scaling**: `StandardScaler` normalizes features to zero mean and unit variance.

---

## Handling Class Imbalance Using SMOTE

Fraud datasets are highly imbalanced — legitimate transactions far outnumber fraudulent ones. This causes models to bias toward the majority class. **SMOTE** (Synthetic Minority Over-sampling Technique) addresses this by generating synthetic samples for the minority class (fraudulent transactions).

```python
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)
```

After SMOTE, the training set has equal numbers of legitimate and fraudulent samples, allowing the models to learn fraud patterns effectively.

---

## Logistic Regression

Logistic Regression is a linear model that estimates the probability of a transaction being fraudulent. It's fast, interpretable, and serves as a strong baseline.

```python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train_balanced, y_train_balanced)
```

---

## Random Forest

Random Forest is an ensemble method that builds multiple decision trees and aggregates their predictions. It captures non-linear patterns and typically outperforms Logistic Regression on fraud detection.

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train_balanced, y_train_balanced)
```

---

## Model Evaluation

Both models are evaluated using five metrics:

| Metric | Description |
|--------|-------------|
| **Accuracy** | Overall correctness of predictions |
| **Precision** | Of flagged frauds, how many were actually fraud |
| **Recall** | Of actual frauds, how many were caught |
| **F1 Score** | Harmonic mean of Precision and Recall |
| **ROC-AUC** | Area under the Receiver Operating Characteristic curve |

A **confusion matrix** is also generated for each model, showing True Negatives, False Positives, False Negatives, and True Positives.

---

## How to Install Python Requirements

```bash
cd ml
pip install -r requirements.txt
```

Requirements:
- pandas >= 2.0.0
- numpy >= 1.24.0
- scikit-learn >= 1.3.0
- imbalanced-learn >= 0.11.0
- joblib >= 1.3.0
- matplotlib >= 3.7.0
- seaborn >= 0.12.0

---

## How to Run the Python ML Files

### 1. Train the Models

```bash
cd ml
python train_model.py
```

This will:
- Load and clean `sample_transactions.csv`
- Apply SMOTE to balance the training data
- Train Logistic Regression and Random Forest
- Print evaluation metrics
- Save the best model to `ml/models/fraud_detection_model.joblib`
- Save confusion matrix plots to `ml/models/`

### 2. Run Batch Prediction

```bash
cd ml
python fraud_detection.py sample_transactions.csv predictions.csv
```

This will:
- Load the saved model
- Predict fraud for each transaction in the CSV
- Print a summary (total, legitimate, fraudulent, fraud percentage)
- Save results to `predictions.csv`

### 3. Single Transaction Prediction (in Python)

```python
from fraud_detection import predict_transaction

result = predict_transaction({
    "Time": 100000,
    "V1": -1.36, "V2": -0.07, "V3": 2.54, "V4": 1.38,
    "V5": -0.43, "V6": 0.93, "V7": 0.02, "V8": 0.24,
    "V9": -0.74, "V10": 0.55,
    "V11": 0, "V12": 0, "V13": 0, "V14": 0,
    "V15": 0, "V16": 0, "V17": 0, "V18": 0,
    "V19": 0, "V20": 0, "V21": 0, "V22": 0,
    "V23": 0, "V24": 0, "V25": 0, "V26": 0,
    "V27": 0, "V28": 0,
    "Amount": 149.62,
})

print(result)
# {'prediction': 0, 'prediction_label': 'Legitimate', 'fraud_probability': 0.12, 'risk_level': 'Low Risk'}
```

---

## How to Run the React Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

The application will be available at `http://localhost:5173`.

> **Note**: The frontend works independently of the Python ML environment. It uses built-in sample data and a client-side prediction heuristic so the dashboard is fully functional even without Python installed. The Python files contain the actual machine learning implementation.

---

## Project Structure

```
credit-card-fraud-detection/
│
├── src/
│   ├── App.tsx                    # Main app with sidebar navigation
│   ├── main.tsx                   # React entry point
│   ├── index.css                   # Global styles and design system
│   ├── data/
│   │   └── fraudData.ts            # Sample data and prediction logic
│   └── components/
│       ├── Sidebar.tsx             # Navigation sidebar
│       ├── Dashboard.tsx           # Overview dashboard
│       ├── DatasetAnalysis.tsx     # Dataset preview and charts
│       ├── FraudPrediction.tsx     # Single transaction prediction form
│       ├── ModelPerformance.tsx    # Model comparison and confusion matrices
│       └── BatchPrediction.tsx     # CSV upload and batch prediction
│
├── ml/
│   ├── train_model.py              # Model training pipeline
│   ├── fraud_detection.py          # Prediction module
│   ├── requirements.txt            # Python dependencies
│   └── sample_transactions.csv     # Sample dataset (300 transactions)
│
├── public/
├── package.json
├── README.md
└── .gitignore
```

---

## Future Enhancements

1. **Real-time streaming**: Integrate with a live transaction stream for real-time fraud detection.
2. **Deep learning models**: Add neural network models (LSTM, Autoencoders) for anomaly detection.
3. **Explainable AI**: Add SHAP or LIME for model explainability — show why a transaction was flagged.
4. **User alerts**: Email/SMS notifications when fraud is detected.
5. **Geolocation analysis**: Incorporate location data to detect unusual transaction locations.
6. **Model retraining pipeline**: Automated retraining when new data arrives.
7. **REST API**: Wrap the Python ML in a REST API (Flask/FastAPI) for production deployment.
8. **Multi-currency support**: Handle transactions in different currencies with conversion.
9. **Historical trend analysis**: Track fraud rates over time with time-series visualization.
10. **Role-based access control**: Add user authentication and authorization for different dashboard views.

---

## License

This project is created for educational purposes as part of a Data Science internship assignment.
