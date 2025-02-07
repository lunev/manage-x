import { HashRouter, Route, Routes } from 'react-router-dom';
import RootLayout from '@/routes/root/Root';
import Dashboard from '@/routes/dashboard/Dashboard';
import Details from '@/routes/details/Details';
import Groups from '@/routes/groups/Groups';

function App() {
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="groups" element={<Groups />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
