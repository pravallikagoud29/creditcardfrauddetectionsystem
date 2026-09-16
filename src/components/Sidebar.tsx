import { LayoutDashboard, Database, Search, BarChart3, Upload, ShieldCheck } from "lucide-react";

export type ViewName = "dashboard" | "dataset" | "prediction" | "performance" | "batch";

interface SidebarProps {
  active: ViewName;
  onNavigate: (view: ViewName) => void;
}

const navItems: { id: ViewName; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "dataset", label: "Dataset Analysis", icon: Database },
  { id: "prediction", label: "Fraud Prediction", icon: Search },
  { id: "performance", label: "Model Performance", icon: BarChart3 },
  { id: "batch", label: "Batch Prediction", icon: Upload },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldCheck size={28} className="sidebar-logo" />
        <div>
          <h1 className="sidebar-title">SecurePay</h1>
          <p className="sidebar-subtitle">Fraud Detection</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-dot" />
          <span>System Active</span>
        </div>
        <p className="sidebar-version">v1.0.0 · ML Powered</p>
      </div>
    </aside>
  );
}
