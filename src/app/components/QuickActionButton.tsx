import { ReactNode } from "react";
import { motion } from "framer-motion";

interface QuickActionButtonProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export default function QuickActionButton({ icon, children, onClick }: QuickActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F9] text-[#863F44] font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F3F0FF] transition-colors"
    >
      {icon}
      {children}
    </motion.button>
  );
}