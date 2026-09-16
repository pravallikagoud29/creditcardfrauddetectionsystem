import { Table, BarChart3 } from "lucide-react";
import { sampleTransactions, getDashboardStats } from "@/data/fraudData";

export default function DatasetAnalysis() {
  const stats = getDashboardStats();
  const preview = sampleTransactions.slice(0, 10);
  const columns = ["Time", "V1", "V2", "V3", "V4", "V5", "Amount", "Class"];

  const maxCount = Math.max(stats.legitimate, stats.fraudulent);

  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Dataset Analysis</h2>
        <p className="view-subtitle">Explore the credit card transaction dataset</p>
      </div>

      <div className="card-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <p className="stat-card-label">Total Transactions</p>
            <p className="stat-card-value">{stats.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-body">
            <p className="stat-card-label">Legitimate</p>
            <p className="stat-card-value">{stats.legitimate.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-card-red">
          <div className="stat-card-body">
            <p className="stat-card-label">Fraudulent</p>
            <p className="stat-card-value">{stats.fraudulent.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-card-orange">
          <div className="stat-card-body">
            <p className="stat-card-label">Fraud Percentage</p>
            <p className="stat-card-value">{stats.fraudPercentage.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <BarChart3 size={20} />
        <h3 className="section-title">Legitimate vs Fraudulent</h3>
      </div>

      <div className="chart-container">
        <div className="bar-chart">
          <div className="bar-row">
            <div className="bar-label">Legitimate</div>
            <div className="bar-track">
              <div
                className="bar-fill bar-fill-green"
                style={{ width: `${(stats.legitimate / maxCount) * 100}%` }}
              />
              <span className="bar-value">{stats.legitimate}</span>
            </div>
          </div>
          <div className="bar-row">
            <div className="bar-label">Fraudulent</div>
            <div className="bar-track">
              <div
                className="bar-fill bar-fill-red"
                style={{ width: `${(stats.fraudulent / maxCount) * 100}%` }}
              />
              <span className="bar-value">{stats.fraudulent}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <Table size={20} />
        <h3 className="section-title">Dataset Preview (first 10 rows)</h3>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((tx, i) => (
              <tr key={i}>
                <td>{tx.Time}</td>
                <td>{tx.V1.toFixed(4)}</td>
                <td>{tx.V2.toFixed(4)}</td>
                <td>{tx.V3.toFixed(4)}</td>
                <td>{tx.V4.toFixed(4)}</td>
                <td>{tx.V5.toFixed(4)}</td>
                <td>{tx.Amount.toFixed(2)}</td>
                <td>
                  <span className={`class-badge ${tx.Class === 1 ? "class-badge-fraud" : "class-badge-legit"}`}>
                    {tx.Class === 1 ? "Fraud" : "Legit"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
