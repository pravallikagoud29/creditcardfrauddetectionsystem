import { TrendingUp, TrendingDown, Activity, Target, Zap, Gauge, CheckCircle, AlertTriangle } from "lucide-react";
import { getDashboardStats, modelMetrics } from "@/data/fraudData";

export default function Dashboard() {
  const stats = getDashboardStats();
  const bestModel = modelMetrics[1]; // Random Forest is best

  const cards = [
    { label: "Total Transactions", value: stats.total.toLocaleString(), icon: Activity, color: "blue" },
    { label: "Legitimate", value: stats.legitimate.toLocaleString(), icon: CheckCircle, color: "green" },
    { label: "Fraudulent", value: stats.fraudulent.toLocaleString(), icon: AlertTriangle, color: "red" },
    { label: "Fraud Percentage", value: `${stats.fraudPercentage.toFixed(2)}%`, icon: TrendingDown, color: "orange" },
  ];

  const metricCards = [
    { label: "Accuracy", value: `${(bestModel.accuracy * 100).toFixed(2)}%`, icon: Target, color: "blue" },
    { label: "Precision", value: `${(bestModel.precision * 100).toFixed(2)}%`, icon: Zap, color: "green" },
    { label: "Recall", value: `${(bestModel.recall * 100).toFixed(2)}%`, icon: Gauge, color: "teal" },
    { label: "F1 Score", value: bestModel.f1.toFixed(4), icon: TrendingUp, color: "indigo" },
  ];

  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Dashboard</h2>
        <p className="view-subtitle">Real-time fraud detection overview</p>
      </div>

      <div className="card-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`stat-card stat-card-${card.color}`}>
              <div className="stat-card-icon">
                <Icon size={24} />
              </div>
              <div className="stat-card-body">
                <p className="stat-card-label">{card.label}</p>
                <p className="stat-card-value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-header">
        <h3 className="section-title">Model Performance (Random Forest)</h3>
      </div>

      <div className="card-grid">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`stat-card stat-card-${card.color}`}>
              <div className="stat-card-icon">
                <Icon size={24} />
              </div>
              <div className="stat-card-body">
                <p className="stat-card-label">{card.label}</p>
                <p className="stat-card-value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h4 className="summary-title">ROC-AUC Score</h4>
          <div className="roc-display">
            <div className="roc-value">{bestModel.roc_auc.toFixed(4)}</div>
            <div className="roc-bar">
              <div className="roc-bar-fill" style={{ width: `${bestModel.roc_auc * 100}%` }} />
            </div>
            <p className="roc-label">Area Under Curve — higher is better</p>
          </div>
        </div>
        <div className="summary-card">
          <h4 className="summary-title">Detection Summary</h4>
          <div className="detection-summary">
            <div className="detection-row">
              <span className="detection-dot detection-dot-green" />
              <span className="detection-label">Legitimate</span>
              <span className="detection-value">{stats.legitimate}</span>
            </div>
            <div className="detection-row">
              <span className="detection-dot detection-dot-red" />
              <span className="detection-label">Fraudulent</span>
              <span className="detection-value">{stats.fraudulent}</span>
            </div>
            <div className="detection-bar">
              <div
                className="detection-bar-legit"
                style={{ width: `${(stats.legitimate / stats.total) * 100}%` }}
              />
              <div
                className="detection-bar-fraud"
                style={{ width: `${(stats.fraudulent / stats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
