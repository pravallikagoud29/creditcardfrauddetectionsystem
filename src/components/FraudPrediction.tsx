import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { predictFraud, type PredictionResult } from "@/data/fraudData";

const inputFields = [
  { key: "Amount", label: "Amount", placeholder: "e.g. 149.62" },
  { key: "Time", label: "Time (seconds)", placeholder: "e.g. 100000" },
  { key: "V1", label: "V1", placeholder: "e.g. -1.3598" },
  { key: "V2", label: "V2", placeholder: "e.g. -0.0728" },
  { key: "V3", label: "V3", placeholder: "e.g. 2.5363" },
  { key: "V4", label: "V4", placeholder: "e.g. 1.3750" },
  { key: "V5", label: "V5", placeholder: "e.g. -0.4280" },
  { key: "V6", label: "V6", placeholder: "e.g. 0.9310" },
  { key: "V7", label: "V7", placeholder: "e.g. 0.0216" },
  { key: "V8", label: "V8", placeholder: "e.g. 0.2423" },
  { key: "V9", label: "V9", placeholder: "e.g. -0.7412" },
  { key: "V10", label: "V10", placeholder: "e.g. 0.5487" },
] as const;

type InputKey = (typeof inputFields)[number]["key"];

export default function FraudPrediction() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleCheck = () => {
    const input: Record<string, number> = {};
    for (const field of inputFields) {
      const v = values[field.key];
      input[field.key] = v ? parseFloat(v) : 0;
    }
    const res = predictFraud(input as Record<InputKey, number>);
    setResult(res);
  };

  const riskClass = result
    ? result.riskLevel === "High Risk"
      ? "result-high"
      : result.riskLevel === "Medium Risk"
        ? "result-medium"
        : "result-low"
    : "";

  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Fraud Prediction</h2>
        <p className="view-subtitle">Check a single transaction for fraud indicators</p>
      </div>

      <div className="prediction-layout">
        <div className="prediction-form-card">
          <h3 className="section-title">Transaction Details</h3>
          <div className="form-grid">
            {inputFields.map((field) => (
              <div key={field.key} className="form-field">
                <label className="form-label">{field.label}</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={handleCheck}>
            <Search size={18} />
            Check Transaction
          </button>
        </div>

        <div className="prediction-result-card">
          <h3 className="section-title">Prediction Result</h3>
          {!result ? (
            <div className="result-empty">
              <Search size={48} className="result-empty-icon" />
              <p>Enter transaction details and click "Check Transaction" to see the prediction.</p>
            </div>
          ) : (
            <div className={`result-display ${riskClass}`}>
              <div className="result-icon">
                {result.prediction === 1 ? (
                  <AlertTriangle size={48} />
                ) : (
                  <CheckCircle size={48} />
                )}
              </div>
              <div className="result-prediction">{result.predictionLabel}</div>
              <div className="result-probability-row">
                <span className="result-probability-label">Fraud Probability</span>
                <span className="result-probability-value">
                  {(result.fraudProbability * 100).toFixed(2)}%
                </span>
              </div>
              <div className="probability-bar">
                <div
                  className="probability-bar-fill"
                  style={{ width: `${result.fraudProbability * 100}%` }}
                />
              </div>
              <div className="result-risk-row">
                <ShieldAlert size={20} />
                <span className="result-risk-label">Risk Level:</span>
                <span className={`result-risk-badge ${riskClass}`}>{result.riskLevel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
