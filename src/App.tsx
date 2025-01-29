import { HashRouter, Route, Routes } from 'react-router-dom';
import RootLayout from '@/routes/root/Root';
import Dashboard from '@/routes/dashboard/Dashboard';
import Preferences from '@/routes/preferences/Preferences';

function App() {
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/preferences" element={<Preferences />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
