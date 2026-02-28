import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col bg-[var(--bg-page)]">
      {/* Drag region for window chrome */}
      <div className="h-[52px] shrink-0 bg-[var(--bg-chrome)]" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
