import { useState } from "react";
import { LayoutDashboard, Shield, Map, Users, Menu, X } from "lucide-react";
import DashboardOverview from "@/components/DashboardOverview";
import ControlsBrowser from "@/components/ControlsBrowser";
import RoadmapView from "@/components/RoadmapView";
import ClientTracker from "@/components/ClientTracker";

type View = "dashboard" | "controls" | "roadmap" | "clients";

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "controls", label: "Controls", icon: Shield },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "clients", label: "Client Tracker", icon: Users },
];

const Index = () => {
  const [view, setView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-5 border-b border-sidebar-border">
          <h1 className="text-sm font-bold text-sidebar-primary-foreground leading-tight">
            AI Enablement
          </h1>
          <p className="text-[10px] text-sidebar-foreground mt-0.5 opacity-70">Customer Framework v2</p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors active:scale-[0.97] ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground opacity-50">
            Data from CSV files in /public/data/
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-md hover:bg-muted active:scale-95">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold">AI Enablement Framework</h1>
        </header>

        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {view === "dashboard" && <DashboardOverview />}
          {view === "controls" && <ControlsBrowser />}
          {view === "roadmap" && <RoadmapView />}
          {view === "clients" && <ClientTracker />}
        </div>
      </main>
    </div>
  );
};

export default Index;
