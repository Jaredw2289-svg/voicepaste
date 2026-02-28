import React from 'react';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, accentColor }) => {
  return (
    <div className="flex flex-1 flex-col gap-[8px] rounded-[14px] bg-[var(--bg-card)] p-[24px]">
      <span className="text-[16px] leading-none">{icon}</span>
      <span
        className="font-mono text-[28px] font-medium tracking-[-0.5px] text-[var(--text-primary)]"
      >
        {value}
      </span>
      <span className="text-[12px] font-sans text-[var(--text-secondary)]">
        {label}
      </span>
      <div
        className="h-[3px] w-full rounded-[2px]"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
};

export default StatCard;
