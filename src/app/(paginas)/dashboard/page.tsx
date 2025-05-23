"use client";

import { motion } from "framer-motion";
import {
  FiHome,
  FiCheckSquare,
  FiUsers,
  FiGift,
  FiSettings,
  FiMessageCircle,
} from "react-icons/fi";
import Image from "next/image";
import "@fontsource/playfair-display/400.css";
import "@fontsource/inter/400.css";
import CountUp from "react-countup";

const navItems = [
  { icon: FiHome, label: "Overview" },
  { icon: FiCheckSquare, label: "Tarefas" },
  { icon: FiUsers, label: "Convidadas" },
  { icon: FiGift, label: "Fornecedores" },
  { icon: FiSettings, label: "Configurações" },
];

export default function DashboardPage() {
  return (
    <div className="bg-[#FEFBF9] min-h-screen w-full flex flex-col font-sans relative">
      {/* Header */}
      <header className="sticky top-0 left-0 w-full z-20 bg-transparent rounded-b-2xl shadow flex items-center justify-between px-4 md:px-12 py-4 md:py-6">
        {/* Mobile: Só título + avatar */}
        <div className="flex w-full items-center justify-between md:hidden">
          <div
            className="text-2xl font-serif text-[#2D1F1A] tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Dashboard
          </div>
          <Image
            src="/avatars/bride.svg"
            alt="Bride"
            width={40}
            height={40}
            className="rounded-full border-2 border-white shadow"
          />
        </div>

        {/* Desktop: Título + navegação + avatares */}
        <div className="hidden md:flex w-full items-center justify-right">
          <div
            className="text-2xl font-serif text-[#2D1F1A] tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Dashboard
          </div>
          <nav className="flex-1 flex justify-center gap-8 md:gap-12">
            {["Pagina inicial", "Tarefas", "Convidados","Fornecedores",].map((item) => (
              <a
                key={item}
                href="#"
                className="relative px-3 py-2 text-[#2D1F1A] font-medium text-base transition-all duration-150
            hover:text-[#C67C5A] focus:text-[#C67C5A]
            after:content-[''] after:block after:h-0.5 after:w-0 after:bg-[#C67C5A]
            after:transition-all after:duration-300 after:mx-auto
            hover:after:w-6 focus:after:w-6"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex -space-x-2 items-center">
            <Image
              src="/avatars/bride.svg"
              alt="Bride"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow"
            />
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex w-full">
        {/* Main dashboard card */}
        <div className="flex-1 flex flex-col w-full h-full">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 w-full">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#FAF5F0] rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px]"
              >
                <div className="flex items-center">
                  <Image
                    src="/illustrations/bride-full.svg"
                    alt="Bride"
                    width={80}
                    height={120}
                  />
                  <div className="ml-4">
                    <h2
                      className="text-2xl font-serif text-[#2D1F1A]"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      Bem vinda!
                    </h2>
                    <p className="text-sm text-[#6B5E57] mt-2">
                      Planeje seu casamento passo por passo
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="w-full py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors"
                >
                  Olhar CheckList
                </motion.button>
              </motion.div>

              {/* RSVP Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-between min-h-[220px]"
              >
                <h2
                  className="text-2xl font-serif text-[#2D1F1A] mb-4"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Convidados
                </h2>
                <div className="flex flex-col items-center">
                  <p className="text-5xl font-semibold text-[#2D1F1A]">45</p>
                  <span className="text-sm text-[#6B5E57] mt-1">Confirmados</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="w-full py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-6"
                >
                  Gerenciar convidados
                </motion.button>
              </motion.div>

              {/* Ceremony Details */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px]"
              >
                <h2
                  className="text-2xl font-serif text-[#2D1F1A]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Detalhes da cerimonia
                </h2>
                <ul className="text-sm text-[#6B5E57] mt-2 space-y-1">
                  <li>24 de Setembro, 2025</li>
                  <li>4:00 PM</li>
                  <li>Igreja Guadalupe</li>
                </ul>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="w-full py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors"
                >
                  Editar Detalhes
                </motion.button>
              </motion.div>
            </div>

            {/* Sidebar and Bottom Cards */}
            <div className="flex flex-col md:flex-row gap-6 mt-8">
              {/* Sidebar */}
              <nav
                className="hidden md:flex flex-col gap-4 w-64"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {navItems.map(({ icon: Icon, label }, idx) => (
                  <a
                    key={label}
                    href="#"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 hover:bg-[#E9D8C7] ${
                      idx === 0
                        ? "bg-[#E9D8C7] text-[#C67C5A] font-semibold"
                        : "text-[#6B5E57]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{label}</span>
                  </a>
                ))}
              </nav>

              {/* Bottom Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
                {/* Wedding planning progress */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px]"
                >
                  <h2
                    className="text-2xl font-serif text-[#2D1F1A] mb-2"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    tarefas do casamento
                  </h2>
                  <ProgressRing percent={45} />
                  <p className="text-sm text-[#6B5E57] mt-2">Complete</p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4"
                  >
                    Ver todas as Tasks
                  </motion.button>
                </motion.div>

                {/* Budget overview */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px]"
                >
                  <h2
                    className="text-2xl font-serif text-[#2D1F1A] mb-2"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Valor gasto
                  </h2>
                  <p className="text-3xl font-semibold text-[#2D1F1A]">
                    R$10,200
                  </p>
                  <BudgetBar percent={50} />
                  <div className="flex justify-between text-[#6B5E57] text-xs mt-1">
                    <span>Gasto</span>
                    <span>Restante</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4"
                  >
                    Olhar gastos totais
                  </motion.button>
                </motion.div>

                {/* Chat with Cele */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#FAF5F0] rounded-xl shadow-sm p-6 flex flex-col justify-between min-h-[220px]"
                >
                  <h2
                    className="text-lg font-serif text-[#2D1F1A] mb-2"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Chat com a Cele
                  </h2>
                  <p className="text-sm text-[#6B5E57]">
                    Converse sobre o seu casamento, gerencie, cadastre, ela está aqui para te ajudar.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex justify-end mt-4"
                  >
                    <FiMessageCircle className="w-8 h-8 text-[#2D1F1A]" />
                  </motion.div>
                </motion.div>

                {/* Countdown to Wedding */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px]"
                >
                  <h2
                    className="text-2xl font-serif text-[#2D1F1A] mb-2"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Dias para o Casamento
                  </h2>
                  <div className="text-4xl font-bold text-[#C67C5A] flex justify-center">
                    <CountUp end={45} duration={1.2} suffix="dias" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full py-3 bg-[#F9F1E8] text-[#2D1F1A] font-medium rounded-xl hover:bg-opacity-90 transition-colors mt-4"
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
      <nav className="fixed md:hidden left-0 right-0 bottom-0 bg-[#FAF5F0] border-t border-[#ecd8cb] flex justify-around items-center h-16 z-50 rounded-t-2xl shadow-2xl">
        {navItems.map(({ icon: Icon, label }, idx) => (
          <a
            key={label}
            href="#"
            className={`flex flex-col items-center text-xs gap-1 px-1 py-1 ${
              idx === 0 ? "text-[#C67C5A]" : "text-[#6B5E57]"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span>{label.split(" ")[0]}</span>
          </a>
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
