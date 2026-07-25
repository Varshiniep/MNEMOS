import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { IntroSplash } from "./components/brand/IntroSplash";
import { introAlreadyShown } from "./components/brand/introStorage";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DashboardShell } from "./layouts/DashboardShell";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";

import { OverviewPage } from "./pages/dashboard/OverviewPage";
import { AgentRunPage } from "./pages/dashboard/AgentRunPage";
import { WorldModelPage } from "./pages/dashboard/WorldModelPage";
import { BoundedContextPage } from "./pages/dashboard/BoundedContextPage";
import { CorrectionsPage } from "./pages/dashboard/CorrectionsPage";
import { MetricsPage } from "./pages/dashboard/MetricsPage";
import { ArchitecturePage } from "./pages/dashboard/ArchitecturePage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !introAlreadyShown(),
  );

  if (showIntro) {
    return (
      <IntroSplash
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route
            path="/dashboard"
            element={<OverviewPage />}
          />

          <Route
            path="/dashboard/run"
            element={<AgentRunPage />}
          />

          <Route
            path="/dashboard/world"
            element={<WorldModelPage />}
          />

          <Route
            path="/dashboard/context"
            element={<BoundedContextPage />}
          />

          <Route
            path="/dashboard/corrections"
            element={<CorrectionsPage />}
          />

          <Route
            path="/dashboard/metrics"
            element={<MetricsPage />}
          />

          <Route
            path="/dashboard/architecture"
            element={<ArchitecturePage />}
          />

          <Route
            path="/dashboard/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}