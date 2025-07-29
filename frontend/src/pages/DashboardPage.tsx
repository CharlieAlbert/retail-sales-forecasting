"use client";

import type React from "react";

import { useState } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  LineChart,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardProvider } from "@/contexts/dashboard-context";
import OverviewPage from "./OverviewPage";
import InsightsPage from "./InsightsPage";
import ReportsPage from "./ReportsPage";
import UploadPage from "./UploadPage";

type ActivePage = "overview" | "insights" | "reports" | "upload";

const SidebarLink = ({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left",
      active
        ? "bg-gray-200 text-gray-900"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </button>
);

const DashboardPage = () => {
  const [activePage, setActivePage] = useState<ActivePage>("overview");

  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return <OverviewPage />;
      case "insights":
        return <InsightsPage />;
      case "reports":
        return <ReportsPage />;
      case "upload":
        return <UploadPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex-shrink-0">
          <div className="p-4 text-xl font-bold border-b">Sales Dashboard</div>
          <nav className="flex flex-col space-y-1 p-4">
            <SidebarLink
              icon={LayoutDashboard}
              label="Overview"
              active={activePage === "overview"}
              onClick={() => setActivePage("overview")}
            />
            <SidebarLink
              icon={LineChart}
              label="Insights"
              active={activePage === "insights"}
              onClick={() => setActivePage("insights")}
            />
            <SidebarLink
              icon={FileBarChart}
              label="Reports"
              active={activePage === "reports"}
              onClick={() => setActivePage("reports")}
            />
            <SidebarLink
              icon={UploadCloud}
              label="Upload Data"
              active={activePage === "upload"}
              onClick={() => setActivePage("upload")}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPage()}
        </main>
      </div>
    </DashboardProvider>
  );
};

export default DashboardPage;
