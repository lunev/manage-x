import { HashRouter, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import RootLayout from '@/routes/root/Root';
import Dashboard from '@/routes/dashboard/Dashboard';
import ExtensionRules from '@/routes/extension-rules/ExtensionRules';
import GroupRules from '@/routes/group-rules/GroupRules';
import ImportRulesPage from '@/routes/import-rules/ImportRules';
import Faq from '@/routes/faq/Faq';

function App() {
  return (
    <TooltipProvider delayDuration={100}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/extension-rules/new/" element={<ExtensionRules />} />
            <Route path="/extension-rules/:id/edit" element={<ExtensionRules />} />
            <Route path="/group-rules/new" element={<GroupRules />} />
            <Route path="/group-rules/:id/edit" element={<GroupRules />} />
            <Route path="/import/" element={<ImportRulesPage />} />
            <Route path="/faq/" element={<Faq />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
