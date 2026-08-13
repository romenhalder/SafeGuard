import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import LiveMapPage from './pages/LiveMap/LiveMapPage';
import LiveEventsPage from './pages/LiveEvents/LiveEventsPage';
import OfficersPage from './pages/Officers/OfficersPage';
import CitizensPage from './pages/Citizens/CitizensPage';
import ReportsPage from './pages/Reports/ReportsPage';
import GroupDispatchPage from './pages/GroupDispatch/GroupDispatchPage';
import ZoneManagerPage from './pages/ZoneManager/ZoneManagerPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/map" replace />} />
          <Route path="map" element={<LiveMapPage />} />
          <Route path="live-events" element={<LiveEventsPage />} />
          <Route path="officers" element={<OfficersPage />} />
          <Route path="citizens" element={<CitizensPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="group-dispatch" element={<GroupDispatchPage />} />
          <Route path="zones" element={<ZoneManagerPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
