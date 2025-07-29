import Dashboard from "@/components/Dashboard";
import {
  LayoutDashboard,
  UploadCloud,
  LineChart,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SidebarLink = ({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={cn(
      "flex items-center px-4 py-2 text-sm font-medium rounded-md",
      active
        ? "bg-gray-200 text-gray-900"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </a>
);

const DashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex-shrink-0">
        <div className="p-4 text-xl font-bold border-b">Sales Dashboard</div>
        <nav className="flex flex-col space-y-1 p-4">
          <SidebarLink icon={LayoutDashboard} label="Overview" active />
          <SidebarLink icon={LineChart} label="Insights" />
          <SidebarLink icon={FileBarChart} label="Reports" />
          <SidebarLink icon={UploadCloud} label="Upload Data" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
