import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export default function PrimaryButton({ children, onClick, className = '', icon, type = 'button' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 bg-[#863F44] text-white font-bold rounded-2xl shadow-md transition-all duration-200 ease-in-out hover:scale-105 hover:bg-[#6b2e36] focus:outline-none focus:ring-2 focus:ring-[#863F44] font-[\'Nova Slim\',sans-serif] ${className}`}
    >
      {icon && <span className="transition-transform duration-200">{icon}</span>}
      {children}
    </button>
  );
} 