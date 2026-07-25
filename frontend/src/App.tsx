import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { OverviewPage }      from './pages/OverviewPage';
import { AgentRunPage }      from './pages/AgentRunPage';
import { WorldModelPage }    from './pages/WorldModelPage';
import { BoundedContextPage } from './pages/BoundedContextPage';
import { CorrectionsPage }   from './pages/CorrectionsPage';
import { MetricsPage }       from './pages/MetricsPage';
import { ArchitecturePage }  from './pages/ArchitecturePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"             element={<OverviewPage />} />
          <Route path="/run"          element={<AgentRunPage />} />
          <Route path="/world"        element={<WorldModelPage />} />
          <Route path="/context"      element={<BoundedContextPage />} />
          <Route path="/corrections"  element={<CorrectionsPage />} />
          <Route path="/metrics"      element={<MetricsPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
