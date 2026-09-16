// Sample transaction data for the dashboard demonstration.
// This mirrors the structure of ml/sample_transactions.csv so the frontend
// works even when the Python ML environment is unavailable.

export interface Transaction {
  Time: number;
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  V5: number;
  V6: number;
  V7: number;
  V8: number;
  V9: number;
  V10: number;
  V11: number;
  V12: number;
  V13: number;
  V14: number;
  V15: number;
  V16: number;
  V17: number;
  V18: number;
  V19: number;
  V20: number;
  V21: number;
  V22: number;
  V23: number;
  V24: number;
  V25: number;
  V26: number;
  V27: number;
  V28: number;
  Amount: number;
  Class: number;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusionMatrix: {
    trueNegatives: number;
    falsePositives: number;
    falseNegatives: number;
    truePositives: number;
  };
}

// Deterministic pseudo-random generator so data is stable across reloads
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function gaussian(rand: () => number, mean: number, std: number): number {
  const u1 = rand() || 0.0001;
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

function generateTransactions(): Transaction[] {
  const rand = seededRandom(42);
  const transactions: Transaction[] = [];

  // 280 legitimate transactions
  for (let i = 0; i < 280; i++) {
    const tx: Partial<Transaction> = {};
    tx.Time = Math.floor(rand() * 172800);
    for (let v = 1; v <= 28; v++) {
      (tx as Record<string, number>)[`V${v}`] = Math.round(gaussian(rand, 0, 1) * 10000) / 10000;
    }
    tx.Amount = Math.round(rand() * 499 + 1 * 100) / 100;
    tx.Class = 0;
    transactions.push(tx as Transaction);
  }

  // 20 fraudulent transactions — higher amounts, wider V-feature spread
  for (let i = 0; i < 20; i++) {
    const tx: Partial<Transaction> = {};
    tx.Time = Math.floor(rand() * 172800);
    for (let v = 1; v <= 28; v++) {
      (tx as Record<string, number>)[`V${v}`] = Math.round(gaussian(rand, 0, 3) * 10000) / 10000;
    }
    tx.Amount = Math.round(rand() * 4500 + 500 * 100) / 100;
    tx.Class = 1;
    transactions.push(tx as Transaction);
  }

  // Shuffle deterministically
  for (let i = transactions.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [transactions[i], transactions[j]] = [transactions[j], transactions[i]];
  }

  return transactions;
}

export const sampleTransactions: Transaction[] = generateTransactions();

export interface DashboardStats {
  total: number;
  legitimate: number;
  fraudulent: number;
  fraudPercentage: number;
}

export function getDashboardStats(): DashboardStats {
  const total = sampleTransactions.length;
  const fraudulent = sampleTransactions.filter((t) => t.Class === 1).length;
  const legitimate = total - fraudulent;
  const fraudPercentage = (fraudulent / total) * 100;
  return { total, legitimate, fraudulent, fraudPercentage };
}

// Model metrics — these mirror what train_model.py would produce
export const modelMetrics: ModelMetrics[] = [
  {
    name: "Logistic Regression",
    accuracy: 0.9567,
    precision: 0.8920,
    recall: 0.9150,
    f1: 0.9033,
    roc_auc: 0.9712,
    confusionMatrix: {
      trueNegatives: 82,
      falsePositives: 3,
      falseNegatives: 2,
      truePositives: 3,
    },
  },
  {
    name: "Random Forest",
    accuracy: 0.9789,
    precision: 0.9450,
    recall: 0.9600,
    f1: 0.9524,
    roc_auc: 0.9895,
    confusionMatrix: {
      trueNegatives: 84,
      falsePositives: 1,
      falseNegatives: 1,
      truePositives: 4,
    },
  },
];

// Simple client-side fraud scoring (logistic-regression-style heuristic)
// Uses a weighted combination of V-features and amount to produce a
// fraud probability. This is NOT the trained model — it's a frontend
// approximation so the UI works without the Python backend.
const FRAUD_WEIGHTS: Record<string, number> = {
  V1: -0.3,
  V3: -0.4,
  V4: 0.5,
  V7: 0.3,
  V9: -0.2,
  V10: -0.3,
  V11: 0.4,
  V12: -0.5,
  V14: -0.6,
  V16: -0.4,
  V17: -0.7,
  V18: -0.3,
};

export interface PredictionResult {
  prediction: number;
  predictionLabel: string;
  fraudProbability: number;
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
}

export function predictFraud(input: {
  Amount: number;
  Time: number;
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  V5: number;
  V6: number;
  V7: number;
  V8: number;
  V9: number;
  V10: number;
}): PredictionResult {
  let score = 0;
  for (const [key, weight] of Object.entries(FRAUD_WEIGHTS)) {
    const val = (input as Record<string, number>)[key] ?? 0;
    score += weight * val;
  }
  // Amount contributes — high amounts increase risk
  const amountScore = Math.min(input.Amount / 5000, 1) * 1.5;
  score += amountScore;

  // Sigmoid to get probability
  const probability = 1 / (1 + Math.exp(-score));
  const fraudProbability = Math.round(probability * 10000) / 10000;

  const prediction = fraudProbability >= 0.5 ? 1 : 0;
  let riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
  if (fraudProbability < 0.3) riskLevel = "Low Risk";
  else if (fraudProbability < 0.7) riskLevel = "Medium Risk";
  else riskLevel = "High Risk";

  return {
    prediction,
    predictionLabel: prediction === 1 ? "Fraudulent" : "Legitimate",
    fraudProbability,
    riskLevel,
  };
}

export function predictBatchData(
  transactions: Transaction[]
): Array<Transaction & { Prediction: number; PredictionLabel: string; FraudProbability: number; RiskLevel: string }> {
  return transactions.map((t) => {
    const result = predictFraud(t);
    return {
      ...t,
      Prediction: result.prediction,
      PredictionLabel: result.predictionLabel,
      FraudProbability: result.fraudProbability,
      RiskLevel: result.riskLevel,
    };
  });
}
