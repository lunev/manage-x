import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import UpdateNotice from '@/components/update-notice';

const Main = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <main className="fade-in text-xs" key={location.pathname} role="main">
      <UpdateNotice />
      {children}
    </main>
  );
};

export default Main;
