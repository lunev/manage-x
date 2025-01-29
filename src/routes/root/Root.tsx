import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/header/Header';
import Main from '@/components/layout/main/Main';

const RootLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Main>
        <Outlet />
      </Main>
    </>
  );
};

export default RootLayout;
