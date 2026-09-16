import { BarChart3, Grid3x3 } from "lucide-react";
import { modelMetrics } from "@/data/fraudData";

export default function ModelPerformance() {
  const metrics = ["accuracy", "precision", "recall", "f1", "roc_auc"] as const;
  const metricLabels: Record<string, string> = {
    accuracy: "Accuracy",
    precision: "Precision",
    recall: "Recall",
    f1: "F1 Score",
    roc_auc: "ROC-AUC",
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Model Performance</h2>
        <p className="view-subtitle">Compare model evaluation metrics and confusion matrices</p>
      </div>

      <div className="section-header">
        <BarChart3 size={20} />
        <h3 className="section-title">Metrics Comparison</h3>
      </div>

      <div className="metrics-comparison">
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              {modelMetrics.map((m) => (
                <th key={m.name}>{m.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric}>
                <td className="metric-row-label">{metricLabels[metric]}</td>
                {modelMetrics.map((m) => (
                  <td key={m.name}>
                    <div className="metric-cell">
                      <span className="metric-value">
                        {metric === "f1" ? m[metric].toFixed(4) : `${(m[metric] * 100).toFixed(2)}%`}
                      </span>
                      <div className="metric-bar">
                        <div
                          className="metric-bar-fill"
                          style={{ width: `${m[metric] * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header">
        <Grid3x3 size={20} />
        <h3 className="section-title">Confusion Matrices</h3>
      </div>

      <div className="confusion-grid">
        {modelMetrics.map((model) => {
          const cm = model.confusionMatrix;
          const total = cm.trueNegatives + cm.falsePositives + cm.falseNegatives + cm.truePositives;
          return (
            <div key={model.name} className="confusion-card">
              <h4 className="confusion-title">{model.name}</h4>
              <div className="confusion-matrix">
                <div className="confusion-cell confusion-cell-tn">
                  <span className="confusion-cell-value">{cm.trueNegatives}</span>
                  <span className="confusion-cell-label">True Negatives</span>
                </div>
                <div className="confusion-cell confusion-cell-fp">
                  <span className="confusion-cell-value">{cm.falsePositives}</span>
                  <span className="confusion-cell-label">False Positives</span>
                </div>
                <div className="confusion-cell confusion-cell-fn">
                  <span className="confusion-cell-value">{cm.falseNegatives}</span>
                  <span className="confusion-cell-label">False Negatives</span>
                </div>
                <div className="confusion-cell confusion-cell-tp">
                  <span className="confusion-cell-value">{cm.truePositives}</span>
                  <span className="confusion-cell-label">True Positives</span>
                </div>
              </div>
              <div className="confusion-legend">
                <span>Total: {total}</span>
                <span>Accuracy: {(model.accuracy * 100).toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
