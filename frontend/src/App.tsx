import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { IntroSplash, introAlreadyShown } from './components/brand/IntroSplash';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardShell } from './layouts/DashboardShell';

import { LandingPage }    from './pages/LandingPage';
import { LoginPage }      from './pages/LoginPage';

import { OverviewPage }       from './pages/dashboard/OverviewPage';
import { AgentRunPage }       from './pages/dashboard/AgentRunPage';
import { WorldModelPage }     from './pages/dashboard/WorldModelPage';
import { BoundedContextPage } from './pages/dashboard/BoundedContextPage';
import { CorrectionsPage }    from './pages/dashboard/CorrectionsPage';
import { MetricsPage }        from './pages/dashboard/MetricsPage';
import { ArchitecturePage }   from './pages/dashboard/ArchitecturePage';
import { SettingsPage }       from './pages/dashboard/SettingsPage';

export default function App() {
  const [showIntro, setShowIntro] = useState(!introAlreadyShown());

  // If user has already seen the intro this session, skip immediately
  useEffect(() => {
    if (introAlreadyShown()) setShowIntro(false);
  }, []);

  return (
    <>
      {/* Intro splash — shown once per session on first visit */}
      {showIntro && (
        <IntroSplash onComplete={() => setShowIntro(false)} />
      )}

      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"      element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardShell />}>
              <Route path="/dashboard"              element={<OverviewPage />} />
              <Route path="/dashboard/run"          element={<AgentRunPage />} />
              <Route path="/dashboard/world"        element={<WorldModelPage />} />
              <Route path="/dashboard/context"      element={<BoundedContextPage />} />
              <Route path="/dashboard/corrections"  element={<CorrectionsPage />} />
              <Route path="/dashboard/metrics"      element={<MetricsPage />} />
              <Route path="/dashboard/architecture" element={<ArchitecturePage />} />
              <Route path="/dashboard/settings"     element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
