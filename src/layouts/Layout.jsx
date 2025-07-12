import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && location.pathname === '/login') {
      navigate('/');
    }

    if (!token && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  const noSidebarRoutes = ['/login'];

  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      <div className="w-72 z-10">
        {showSidebar && <Sidebar />}
      </div>

      <div className="flex flex-col flex-1 relative z-0 mt-12 mr-10">
        {showSidebar && <Header />}
        <main className="flex-1 px-8 pt-5 bg-[#F9FAFB] overflow-auto relative mx-2 mr-0 pr-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
