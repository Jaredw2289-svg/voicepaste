import React from 'react';
import NavItem from './NavItem';

const Sidebar: React.FC = () => {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col gap-[24px] bg-[var(--bg-sidebar)] p-[24px]">
      {/* Logo Section */}
      <div className="flex h-[32px] w-full items-center gap-[8px]">
        <span className="text-[20px] leading-none">🎙️</span>
        <span className="font-heading text-[20px] text-[var(--text-primary)]">
          VoicePaste
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex w-full flex-col gap-[4px]">
        <NavItem to="/dashboard" icon="🏠" label="Home" />
        <NavItem to="/history" icon="🕐" label="History" />
        <NavItem to="/dictionary" icon="📖" label="Dictionary" />
        <NavItem to="/settings" icon="⚙️" label="Settings" />
      </nav>

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  );
};

export default Sidebar;
