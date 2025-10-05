import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CommandPalette from './CommandPalette';

const MainLayout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen text-light-secondary">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div key={location.pathname} className="animate-page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
};

export default MainLayout;