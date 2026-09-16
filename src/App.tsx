import { useState } from "react";
import Sidebar, { type ViewName } from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import DatasetAnalysis from "@/components/DatasetAnalysis";
import FraudPrediction from "@/components/FraudPrediction";
import ModelPerformance from "@/components/ModelPerformance";
import BatchPrediction from "@/components/BatchPrediction";

export default function App() {
  const [view, setView] = useState<ViewName>("dashboard");

  return (
    <div className="app-layout">
      <Sidebar active={view} onNavigate={setView} />
      <main className="main-content">
        {view === "dashboard" && <Dashboard />}
        {view === "dataset" && <DatasetAnalysis />}
        {view === "prediction" && <FraudPrediction />}
        {view === "performance" && <ModelPerformance />}
        {view === "batch" && <BatchPrediction />}
      </main>
    </div>
  );
}
