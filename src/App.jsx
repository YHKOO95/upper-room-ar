import { Outlet, Route, Routes } from 'react-router-dom';
import { SplashPage } from './pages/SplashPage.jsx';
import { PermPage } from './pages/PermPage.jsx';
import { HubPage } from './pages/HubPage.jsx';
import { CompletePage } from './pages/CompletePage.jsx';
import { ReflectPage } from './pages/ReflectPage.jsx';
import { EngravePage } from './pages/EngravePage.jsx';
import { SealPage } from './pages/SealPage.jsx';
import { DetailPage } from './pages/DetailPage.jsx';

function AppShell() {
  return (
    <div id="app">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/detail" element={<DetailPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/perm" element={<PermPage />} />
        <Route path="/hub" element={<HubPage />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="/reflect" element={<ReflectPage />} />
        <Route path="/engrave" element={<EngravePage />} />
        <Route path="/seal" element={<SealPage />} />
      </Route>
    </Routes>
  );
}
