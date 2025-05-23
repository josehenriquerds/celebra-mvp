'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50 backdrop-blur bg-white bg-opacity-60 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-heading text-primary">Celebra</Link>
        <div className="hidden md:flex space-x-8 text-textPrimary">
          <Link href="#solutions" className="hover:text-accent">Soluções</Link>
          <Link href="#testimonials" className="hover:text-accent">Depoimentos</Link>
          <Link href="#pricing" className="hover:text-accent">Planos</Link>
          <Link href="#portfolio" className="hover:text-accent">Portfólio</Link>
          <Link href="#faq" className="hover:text-accent">FAQ</Link>
        </div>
        <button className="hidden md:block px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition">Fale Conosco</button>
        <button className="md:hidden px-3 py-2 bg-primary text-white rounded-md hover:bg-accent transition">Menu</button>
      </div>
    </motion.nav>
  );
}