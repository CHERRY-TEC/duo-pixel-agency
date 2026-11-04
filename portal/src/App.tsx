import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import PortalLayout from './components/PortalLayout';
import Dashboard from './pages/Dashboard';
import DashboardBooking from './pages/DashboardBooking';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import Track from './pages/Track';

/**
 * Portal router — tracking, the client area and the two designer dashboards.
 * The marketing site lives in the sibling `site/` app.
 */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function RequireDesigner({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: '/dashboard' }} />;
  if (user.role !== 'designer') return <Navigate to="/account/my-bookings" replace />;
  return children;
}

function RouteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-accent" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<PortalLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/track" element={<Track />} />
        <Route
          path="/account/my-bookings"
          element={
            <RequireAuth>
              <MyBookings />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireDesigner>
              <Dashboard />
            </RequireDesigner>
          }
        />
        <Route
          path="/dashboard/bookings/:id"
          element={
            <RequireDesigner>
              <DashboardBooking />
            </RequireDesigner>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
