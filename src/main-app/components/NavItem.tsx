import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-[12px] h-[44px] w-full rounded-[8px] p-[12px] no-underline transition-colors ${
          isActive
            ? 'bg-[var(--border-light)]'
            : 'bg-transparent hover:bg-[var(--border-light)]/50'
        }`
      }
    >
      <span className="text-[16px] leading-none">{icon}</span>
      <span className="text-[14px] font-sans text-[var(--text-primary)]">
        {label}
      </span>
    </NavLink>
  );
};

export default NavItem;
