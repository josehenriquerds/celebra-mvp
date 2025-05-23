'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MobileMenu({ open, toggle }: { open: boolean; toggle: () => void }) {
  return (
    <motion.nav
      initial={{ x: '100%' }}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-white z-50 p-8"
    >
      <button className="absolute top-4 right-4 text-2xl" onClick={toggle}>×</button>
      <ul className="space-y-6 text-xl">
        {['Início', 'Funcionalidades', 'Preços', 'Depoimentos', 'Contato'].map(link => (
          <li key={link}>
            <Link href={`#${link.toLowerCase()}`} className="text-gray-800 hover:text-[#863F44]" onClick={toggle}>
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}