import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}> = ({ children, className = '', id, onClick }) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-[#FFFFFF] text-[#1A1A1A] border border-[#1A1A1A] p-6 shadow-none transition-all ${
        onClick ? 'cursor-pointer hover:bg-[#F9F7F2] hover:shadow-xs' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 mb-4 border-b border-[#1A1A1A]/15 ${className}`}>
      <div>
        <h3 className="text-base font-serif font-bold text-[#1A1A1A] tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-[#5C5850] font-sans mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

