// src/AppRoutes.js
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PlantManage from './pages/PlantManage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIPredict from './pages/AIPredict';
import Login from './Login';
import { useGlobal } from './services/globalContext';

function RequireAuth({ isLogined }) {
  if (!isLogined) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function checkLogin() {
  return document.cookie.split(';').some((c) => c.trim().startsWith('tk='));
}

function AppRoutes() {
  const { isLogined, setIsLogined } = useGlobal();

  useEffect(() => {
    setIsLogined(checkLogin());
  }, [setIsLogined]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isLogined ? <Navigate to="/realtime-data" replace /> : <Login onLoginSuccess={() => setIsLogined(true)} />}
        />

        <Route element={<RequireAuth isLogined={isLogined} />}>
          <Route path="/realtime-data" element={<PlantManage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ai" element={<AIPredict />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
