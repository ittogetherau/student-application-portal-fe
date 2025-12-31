import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { PortalSwitcher } from './components/shared/PortalSwitcher';

// Portal Layouts
import AgentLayout from './components/layouts/AgentLayout';
import StaffLayout from './components/layouts/StaffLayout';
import StudentLayout from './components/layouts/StudentLayout';

// Agent Portal Pages
import AgentDashboard from './pages/agent/Dashboard';
import AgentApplications from './pages/agent/Applications';
import AgentApplicationDetail from './pages/agent/ApplicationDetail';
import AgentNewApplication from './pages/agent/NewApplication';
import AgentEditApplication from './pages/agent/EditApplication';
import AgentInterviews from './pages/agent/Interviews';
import AgentReports from './pages/agent/Reports';

// Staff Portal Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffApplicationQueue from './pages/staff/ApplicationQueue';
import StaffApplicationReview from './pages/staff/ApplicationReview';
import StaffInterviews from './pages/staff/Interviews';
import StaffCOEManagement from './pages/staff/COEManagement';
import StaffTasks from './pages/staff/Tasks';

// Student Portal Pages
import StudentTracking from './pages/student/Tracking';
import StudentOfferSigning from './pages/student/OfferSigning';
import StudentGSForm from './pages/student/GSForm';

// Auth Pages
import Login from './pages/auth/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <PortalSwitcher />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Agent Portal */}
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="applications" element={<AgentApplications />} />
            <Route path="applications/new" element={<AgentNewApplication />} />
            <Route path="applications/edit/:id" element={<AgentEditApplication />} />
            <Route path="applications/:id" element={<AgentApplicationDetail />} />
            <Route path="interviews" element={<AgentInterviews />} />
            <Route path="reports" element={<AgentReports />} />
          </Route>

          {/* Staff Portal */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="queue" element={<StaffApplicationQueue />} />
            <Route path="review/:id" element={<StaffApplicationReview />} />
            <Route path="interviews" element={<StaffInterviews />} />
            <Route path="coe" element={<StaffCOEManagement />} />
            <Route path="tasks" element={<StaffTasks />} />
          </Route>

          {/* Student Portal */}
          <Route path="/track" element={<StudentLayout />}>
            <Route index element={<StudentTracking />} />
            <Route path="offer/:trackingId" element={<StudentOfferSigning />} />
            <Route path="gs-form/:trackingId" element={<StudentGSForm />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}