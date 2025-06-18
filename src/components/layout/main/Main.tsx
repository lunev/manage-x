import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const Main: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <main className="fade-in text-xs" key={location.pathname} role="main">
      {children}
      <Toaster />
    </main>
  );
};

export default Main;
