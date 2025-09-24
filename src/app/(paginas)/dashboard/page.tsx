"use client";

import { motion } from "framer-motion";
import {
  FiHome,
  FiCheckSquare,
  FiUsers,
  FiGift,
  FiSettings,
  FiMessageCircle,
  FiMenu,
  FiX,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "@fontsource/playfair-display/400.css";
import "@fontsource/inter/400.css";
import CountUp from "react-countup";

const navItems = [
  { icon: FiHome, label: "Overview", href: "/dashboard" },
  { icon: FiCheckSquare, label: "Tarefas", href: "/tarefas" },
  { icon: FiUsers, label: "Convidados", href: "/convidados" },
  { icon: FiGift, label: "Presentes", href: "/presentes" },
  { icon: FiSettings, label: "Configurações", href: "/configuracoes" },
];

const headerNavItems = [
  { label: "Página inicial", href: "/dashboard" },
  { label: "Convidados", href: "/convidados" },
  { label: "Presentes", href: "/presentes" },
  { label: "Mensagens", href: "/mensagens" },
];

export default function DashboardPage() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-[#FEFBF9] min-h-screen w-full flex flex-col font-sans relative">
      {/* Header */}
      <header className="sticky top-0 left-0 w-full z-20 bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-sm border-b border-[#ecd8cb]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* Mobile Header */}
          <div className="flex w-full items-center justify-between md:hidden">
            <div
              className="text-xl sm:text-2xl font-serif text-[#2D1F1A] tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Dashboard
            </div>
            <div className="flex items-center gap-3">
              <Image
                src="/avatars/bride.svg"
                alt="Bride"
                width={36}
                height={36}
                className="rounded-full border-2 border-white shadow-sm"
              />
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-[#2D1F1A] hover:text-[#C67C5A] transition-colors"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex w-full items-center justify-between">
            <div
              className="text-2xl lg:text-3xl font-serif text-[#2D1F1A] tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Dashboard
            </div>
            <nav className="flex-1 flex justify-center gap-6 lg:gap-8">
              {headerNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative px-3 py-2 text-[#2D1F1A] font-medium text-sm lg:text-base transition-all duration-200
                    hover:text-[#C67C5A] focus:text-[#C67C5A]
                    after:content-[''] after:block after:h-0.5 after:w-0 after:bg-[#C67C5A]
                    after:transition-all after:duration-300 after:mx-auto
                    hover:after:w-6 focus:after:w-6 ${
                      pathname === item.href ? 'text-[#C67C5A] after:w-6' : ''
                    }`}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Image
                src="/avatars/bride.svg"
                alt="Bride"
                width={40}
                height={40}
                className="rounded-full border-2 border-white shadow-sm"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-4 pt-4 border-t border-[#ecd8cb]/30"
            >
              <nav className="flex flex-col gap-2">
                {headerNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-[#2D1F1A] font-medium text-base transition-all duration-200
                      hover:text-[#C67C5A] hover:bg-[#FAF5F0] rounded-lg ${
                        pathname === item.href ? 'text-[#C67C5A] bg-[#FAF5F0]' : ''
                      }`}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex w-full">
        {/* Main dashboard card */}
        <div className="flex-1 flex flex-col w-full h-full">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 lg:p-12 w-full mx-4 sm:mx-6 lg:mx-8 my-4 sm:my-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Welcome Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#FAF5F0] rounded-xl shadow-md p-4 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] col-span-1 sm:col-span-2 lg:col-span-1"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <Image
                    src="/illustrations/bride-full.svg"
                    alt="Bride"
                    width={60}
                    height={90}
                    className="sm:w-[80px] sm:h-[120px] mb-3 sm:mb-0"
                  />
                  <div className="sm:ml-4 text-center sm:text-left">
                    <h2
                      className="text-xl sm:text-2xl font-serif text-[#2D1F1A]"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      Bem vinda!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B5E57] mt-2">
                      Planeje seu casamento passo por passo
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="w-full py-2.5 sm:py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors text-sm sm:text-base mt-4"
                >
                  Olhar CheckList
                </motion.button>
              </motion.div>

              {/* RSVP Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col items-center justify-between min-h-[200px] sm:min-h-[220px]"
              >
                <h2
                  className="text-xl sm:text-2xl font-serif text-[#2D1F1A] mb-3 sm:mb-4 text-center"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Convidados
                </h2>
                <div className="flex flex-col items-center">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2D1F1A]">45</p>
                  <span className="text-xs sm:text-sm text-[#6B5E57] mt-1">Confirmados</span>
                </div>
                <Link href="/convidados">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-2.5 sm:py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    Gerenciar convidados
                  </motion.button>
                </Link>
              </motion.div>

              {/* Ceremony Details */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
              >
                <h2
                  className="text-xl sm:text-2xl font-serif text-[#2D1F1A] text-center sm:text-left"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Detalhes da cerimônia
                </h2>
                <ul className="text-xs sm:text-sm text-[#6B5E57] mt-2 space-y-1 text-center sm:text-left">
                  <li>24 de Setembro, 2025</li>
                  <li>4:00 PM</li>
                  <li>Igreja Guadalupe</li>
                </ul>
                <Link href="/configuracoes">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-2.5 sm:py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors text-sm sm:text-base mt-4"
                  >
                    Editar Detalhes
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Sidebar and Bottom Cards */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8">
              {/* Sidebar */}
              <nav
                className="hidden lg:flex flex-col gap-3 w-full lg:w-64 order-2 lg:order-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {navItems.map(({ icon: Icon, label, href }, idx) => (
                  <Link
                    key={label}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 hover:bg-[#E9D8C7] ${
                      pathname === href
                        ? "bg-[#E9D8C7] text-[#C67C5A] font-semibold"
                        : "text-[#6B5E57] hover:text-[#C67C5A]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>

              {/* Bottom Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 flex-1 order-1 lg:order-2">
                {/* Wedding planning progress */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                >
                  <h2
                    className="text-lg sm:text-xl lg:text-2xl font-serif text-[#2D1F1A] mb-2 text-center"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Tarefas do casamento
                  </h2>
                  <div className="flex justify-center">
                    <ProgressRing percent={45} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B5E57] mt-2 text-center">Complete</p>
                  <Link href="/tarefas">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      className="w-full py-2.5 sm:py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4 text-sm sm:text-base"
                    >
                      Ver todas as Tasks
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Budget overview */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                >
                  <h2
                    className="text-lg sm:text-xl lg:text-2xl font-serif text-[#2D1F1A] mb-2 text-center"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Valor gasto
                  </h2>
                  <p className="text-2xl sm:text-3xl font-semibold text-[#2D1F1A] text-center">
                    R$10,200
                  </p>
                  <BudgetBar percent={50} />
                  <div className="flex justify-between text-[#6B5E57] text-xs mt-1">
                    <span>Gasto</span>
                    <span>Restante</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-2.5 sm:py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4 text-sm sm:text-base"
                  >
                    Olhar gastos totais
                  </motion.button>
                </motion.div>

                {/* Chat with Cele */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#FAF5F0] rounded-xl shadow-sm p-4 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                >
                  <h2
                    className="text-base sm:text-lg font-serif text-[#2D1F1A] mb-2 text-center"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Chat com a Cele
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B5E57] text-center">
                    Converse sobre o seu casamento, gerencie, cadastre, ela está aqui para te ajudar.
                  </p>
                  <Link href="/mensagens">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex justify-center mt-4 cursor-pointer"
                    >
                      <FiMessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-[#2D1F1A]" />
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Countdown to Wedding */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                >
                  <h2
                    className="text-lg sm:text-xl lg:text-2xl font-serif text-[#2D1F1A] mb-2 text-center"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Dias para o Casamento
                  </h2>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C67C5A] flex justify-center">
                    <CountUp end={45} duration={1.2} suffix=" dias" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-2.5 sm:py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4 text-sm sm:text-base"
                  >
                    Ver timeline
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar mobile fixa, no rodapé, simples */}
      <nav className="fixed lg:hidden left-0 right-0 bottom-0 bg-[#FAF5F0]/95 backdrop-blur-sm border-t border-[#ecd8cb] flex justify-around items-center h-16 z-50 rounded-t-2xl shadow-2xl">
        {navItems.map(({ icon: Icon, label, href }, idx) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center text-xs gap-1 px-1 py-1 transition-colors duration-200 ${
              pathname === href ? "text-[#C67C5A]" : "text-[#6B5E57] hover:text-[#C67C5A]"
            }`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[10px] sm:text-xs">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

// Circular progress ring
function ProgressRing({ percent = 45 }) {
  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#E9D8C7"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke="#C67C5A"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset }}
        initial={{ strokeDashoffset: circumference }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="1.5rem"
        fill="#2D1F1A"
        fontFamily="Inter"
      >
        {percent}%
      </text>
    </svg>
  );
}

// Budget progress bar
function BudgetBar({ percent = 50 }) {
  return (
    <div className="w-full h-3 bg-[#E9D8C7] rounded-full overflow-hidden mt-2 mb-1">
      <motion.div
        className="h-full bg-[#C67C5A]"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}
