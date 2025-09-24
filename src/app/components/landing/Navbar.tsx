'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-x-0 top-0 z-50 backdrop-blur bg-white bg-opacity-60 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">Celebra</Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 text-textPrimary">
            <Link href="/dashboard" className="hover:text-accent transition-colors duration-200">Dashboard</Link>
            <Link href="/convidados" className="hover:text-accent transition-colors duration-200">Convidados</Link>
            <Link href="/presentes" className="hover:text-accent transition-colors duration-200">Presentes</Link>
            <Link href="/mensagens" className="hover:text-accent transition-colors duration-200">Mensagens</Link>
            <Link href="/configuracoes" className="hover:text-accent transition-colors duration-200">Configurações</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors duration-200"
            >
              Entrar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-primary hover:text-accent transition-colors duration-200"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-[72px] z-40 md:hidden bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-200 shadow-lg"
        >
          <div className="px-4 py-6 space-y-4">
            <Link
              href="/dashboard"
              className="block text-lg text-textPrimary hover:text-accent transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/convidados"
              className="block text-lg text-textPrimary hover:text-accent transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Convidados
            </Link>
            <Link
              href="/presentes"
              className="block text-lg text-textPrimary hover:text-accent transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Presentes
            </Link>
            <Link
              href="/mensagens"
              className="block text-lg text-textPrimary hover:text-accent transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Mensagens
            </Link>
            <Link
              href="/configuracoes"
              className="block text-lg text-textPrimary hover:text-accent transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Configurações
            </Link>
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Entrar
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
}