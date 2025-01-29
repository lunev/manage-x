import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

const Main: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <main className="main fade-in" key={location.pathname} role="main">
      {children}
    </main>
  );
};

export default Main;
