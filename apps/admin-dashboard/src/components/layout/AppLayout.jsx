import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLiveStore } from '../../store/liveStore';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const { startLiveSimulation, stopLiveSimulation } = useLiveStore();

  useEffect(() => {
    startLiveSimulation();
    return () => stopLiveSimulation();
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell" id="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-content" id="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
