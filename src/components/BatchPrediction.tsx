import { useRef, useState } from "react";
import { Upload, Download, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { sampleTransactions, predictBatchData, type Transaction } from "@/data/fraudData";

interface BatchResult {
  total: number;
  legitimate: number;
  fraudulent: number;
  fraudPercentage: number;
  rows: Array<Transaction & { Prediction: number; PredictionLabel: string; FraudProbability: number; RiskLevel: string }>;
}

export default function BatchPrediction() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string>("");

  const processTransactions = (transactions: Transaction[]) => {
    const predicted = predictBatchData(transactions);
    const total = predicted.length;
    const fraudulent = predicted.filter((r) => r.Prediction === 1).length;
    const legitimate = total - fraudulent;
    const fraudPercentage = total > 0 ? (fraudulent / total) * 100 : 0;
    setResult({ total, legitimate, fraudulent, fraudPercentage, rows: predicted });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        // Map CSV columns to Transaction fields
        const txns: Transaction[] = lines.slice(1).map((line) => {
          const cols = line.split(",").map((c) => c.trim());
          const tx: Record<string, number> = {};
          headers.forEach((header, idx) => {
            const val = parseFloat(cols[idx]);
            tx[header] = isNaN(val) ? 0 : val;
          });
          // Ensure Class defaults to 0 if missing
          if (tx.Class === undefined) tx.Class = 0;
          return tx as unknown as Transaction;
        });

        if (txns.length === 0) {
          setError("The CSV file appears to be empty or invalid.");
          return;
        }

        processTransactions(txns);
      } catch {
        setError("Failed to parse the CSV file. Please ensure it is a valid CSV.");
      }
    };
    reader.onerror = () => setError("Failed to read the file.");
    reader.readAsText(file);
  };

  const handleUseSample = () => {
    setError("");
    setFileName("sample_transactions.csv");
    processTransactions(sampleTransactions);
  };

  const handleDownload = () => {
    if (!result) return;
    const headers = [
      "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8",
      "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16",
      "V17", "V18", "V19", "V20", "V21", "V22", "V23", "V24",
      "V25", "V26", "V27", "V28", "Amount", "Class",
      "Prediction", "PredictionLabel", "FraudProbability", "RiskLevel",
    ];
    const rows = result.rows.map((r) =>
      headers.map((h) => (r as unknown as Record<string, unknown>)[h] ?? "").join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prediction_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Batch Prediction</h2>
        <p className="view-subtitle">Upload a CSV file to analyze multiple transactions at once</p>
      </div>

      <div className="batch-upload-area">
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={40} className="upload-icon" />
          <p className="upload-text">Click to upload a CSV file</p>
          <p className="upload-hint">
            CSV should contain columns: Time, V1-V28, Amount
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="file-input-hidden"
            onChange={handleFileUpload}
          />
        </div>
        <div className="batch-actions">
          <button className="btn-secondary" onClick={handleUseSample}>
            <FileText size={18} />
            Use Sample Dataset
          </button>
        </div>
        {fileName && <p className="file-name-display">Loaded: {fileName}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>

      {result && (
        <>
          <div className="card-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-card-body">
                <p className="stat-card-label">Total Records</p>
                <p className="stat-card-value">{result.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card stat-card-green">
              <div className="stat-card-body">
                <p className="stat-card-label">Legitimate</p>
                <p className="stat-card-value">{result.legitimate.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card stat-card-red">
              <div className="stat-card-body">
                <p className="stat-card-label">Fraudulent</p>
                <p className="stat-card-value">{result.fraudulent.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card stat-card-orange">
              <div className="stat-card-body">
                <p className="stat-card-label">Fraud Percentage</p>
                <p className="stat-card-value">{result.fraudPercentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="batch-results-header">
            <h3 className="section-title">Prediction Results</h3>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={18} />
              Download Results
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Prediction</th>
                  <th>Fraud Probability</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 50).map((row, i) => (
                  <tr key={i}>
                    <td>{row.Time}</td>
                    <td>{row.Amount.toFixed(2)}</td>
                    <td>
                      <span className={`class-badge ${row.Prediction === 1 ? "class-badge-fraud" : "class-badge-legit"}`}>
                        {row.Prediction === 1 ? (
                          <><AlertTriangle size={12} /> Fraud</>
                        ) : (
                          <><CheckCircle size={12} /> Legit</>
                        )}
                      </span>
                    </td>
                    <td>{(row.FraudProbability * 100).toFixed(2)}%</td>
                    <td>
                      <span className={`risk-badge risk-badge-${row.RiskLevel.toLowerCase().replace(" ", "-")}`}>
                        {row.RiskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.rows.length > 50 && (
              <p className="table-footnote">Showing first 50 of {result.rows.length} records. Download for full results.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
