import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/dashboard/DashboardPage";
import UploadPage from "../pages/upload/UploadPage";
import ArchitectureHistoryPage from "../pages/ArchitectureHistoryPage";
import ArchitectureDetailPage from "../pages/ArchitectureDetailPage";
import ArchitectureComparisonPage from "../pages/ArchitectureComparisonPage";
import SystemOverviewPage from "../pages/SystemOverviewPage";
import StatusManagementPage from "../pages/StatusManagementPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/history" element={<ArchitectureHistoryPage />} />
        <Route path="/architecture/:id" element={<ArchitectureDetailPage />} />
        <Route path="/architecture/:id/compare" element={<ArchitectureComparisonPage />} />
        <Route path="/system-overview" element={<SystemOverviewPage />} />
        <Route path="/status-management" element={<StatusManagementPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;