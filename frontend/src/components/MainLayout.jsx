import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden mesh-gradient">
      <div className="noise-overlay"></div>
      <Sidebar />
      <main className="h-full overflow-y-auto relative z-10 lg:pl-80 pb-28 lg:pb-0 pt-6 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
