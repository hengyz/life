import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { isLoggedIn } from './lib/auth';
import { DogHome } from './routes/DogHome';
import { DogTimeline } from './routes/DogTimeline';
import { Home } from './routes/Home';
import { TimelineDetail } from './routes/TimelineDetail';
import { AdminDashboard } from './routes/admin/Dashboard';
import { AdminLogin } from './routes/admin/Login';
import { PetProfileEditor } from './routes/admin/PetProfileEditor';
import { TimelineManager } from './routes/admin/TimelineManager';
import { TimelineNodeEditor } from './routes/admin/TimelineNodeEditor';
import { PrepAdminLayout } from './components/PrepAdminLayout';
import { PrepBudgetManager } from './routes/admin/prep/PrepBudgetManager';
import { PrepChecklistManager } from './routes/admin/prep/PrepChecklistManager';
import { PrepDashboard } from './routes/admin/prep/PrepDashboard';
import { PrepProfileEditor } from './routes/admin/prep/PrepProfileEditor';
import { PrepBudget } from './routes/prep/PrepBudget';
import { PrepChecklist } from './routes/prep/PrepChecklist';
import { PrepHome } from './routes/prep/PrepHome';

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function AdminIndex() {
  if (isLoggedIn()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin />;
}

function LegacyAdminRedirect() {
  const { pathname, search, hash } = useLocation();
  return (
    <Navigate
      to={`${pathname.replace(/^\/gy-admin/, '/admin')}${search}${hash}`}
      replace
    />
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dog" element={<DogHome />} />
      <Route path="/dog/timeline" element={<DogTimeline />} />
      <Route path="/dog/timeline/:id" element={<TimelineDetail />} />

      <Route path="/prep" element={<PrepHome />} />
      <Route path="/prep/budget" element={<PrepBudget />} />
      <Route path="/prep/checklist" element={<PrepChecklist />} />

      <Route path="/admin" element={<Outlet />}>
        <Route index element={<AdminIndex />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pet" element={<PetProfileEditor />} />
          <Route path="timeline" element={<TimelineManager />} />
          <Route path="timeline/new" element={<TimelineNodeEditor />} />
          <Route path="timeline/:id" element={<TimelineNodeEditor />} />
          <Route path="prep" element={<PrepAdminLayout />}>
            <Route index element={<PrepDashboard />} />
            <Route path="profile" element={<PrepProfileEditor />} />
            <Route path="budget" element={<PrepBudgetManager />} />
            <Route path="checklist" element={<PrepChecklistManager />} />
          </Route>
        </Route>
      </Route>

      <Route path="/gy-admin/*" element={<LegacyAdminRedirect />} />
    </Routes>
  );
}
