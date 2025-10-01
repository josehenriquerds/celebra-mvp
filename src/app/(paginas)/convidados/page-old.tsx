"use client";
import Sidebar from "../../components/Sidebar";
import DashboardCard from "../../components/DashboardCard";
import QuickActionButton from "../../components/QuickActionButton";
import { Calendar, Users, Gift, Mail, Plus, Edit3, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const EVENTO = {
  nome: "Casamento de Davi & Bia",
  data: "2025-08-15T17:00:00",
  local: "Vitória/ES",
  confirmados: 120,
  total: 150,
  presentes: 35,
  mensagens: 4,
  ultimaMensagem: "Parabéns aos noivos! 🎉",
};

const TIMELINE = [
  { icon: <Users size={18} />, text: "Novo convidado adicionado: Ana Paula", date: "10/06/2024" },
  { icon: <Gift size={18} />, text: "Presente recebido: Jogo de Panelas", date: "09/06/2024" },
  { icon: <Edit3 size={18} />, text: "Informações do evento atualizadas", date: "08/06/2024" },
  { icon: <Mail size={18} />, text: "Mensagem recebida de João", date: "07/06/2024" },
];

export default function Dashboard() {
  const [evento] = useState(EVENTO);
  const [timeline] = useState(TIMELINE);
  const percent = Math.round((evento.confirmados / evento.total) * 100);

  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen bg-white font-[\'Nova Slim\',sans-serif]">
      <Sidebar />
      <main className="ml-0 md:ml-64 px-4 md:px-8 py-8 md:py-12 w-full bg-white min-h-screen">
        {/* Cabeçalho do evento */}
        <header className="mb-8 flex flex-col gap-2">
          <span className="uppercase tracking-widest text-[#B87D8A] text-xs font-semibold">Resumo do Evento</span>
          <h1 className="text-2xl md:text-3xl font-[600] font-[\'Nova Slim\',sans-serif] text-[#2B2B2B]">{evento.nome}</h1>
          <div className="text-[#6B6B6B] text-base flex items-center gap-2">
            <Calendar size={18} className="text-[#B87D8A]" />
            {new Date(evento.data).toLocaleDateString()} • {evento.local}
          </div>
        </header>
        {/* Cards informativos - layout fluido */}
        <section className="flex flex-col xl:flex-row gap-6 mb-10">
          <div className="flex-1 xl:max-w-lg">
            {/* <DashboardCard icon={<Users size={28} />} title="Convidados" delay={0.05} bgColor="#F3F0FF">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-green-500" />
                <span className="text-green-700 font-semibold">{evento.confirmados} confirmados</span>
                <AlertCircle size={18} className="text-yellow-500 ml-4" />
                <span className="text-yellow-700 font-semibold">{evento.total - evento.confirmados} pendentes</span>
              </div>
              <div className="w-full h-2 bg-[#E8F5E9] rounded-full mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: percent + '%' }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="h-2 bg-gradient-to-r from-[#B87D8A] to-[#F3C6C6] rounded-full"
                />
              </div>
              <div className="text-sm text-[#B87D8A]">{percent}% de confirmações</div>
            </DashboardCard> */}
          </div>
          <div className="flex flex-1 flex-col gap-6 xl:flex-row">
            {/* <DashboardCard icon={<Gift size={28} />} title="Presentes Recebidos" delay={0.12} bgColor="#FFF9F9">
              <div className="text-lg font-medium text-[#2B2B2B] mb-2">{evento.presentes} presentes confirmados</div>
              <button className="text-[#B87D8A] font-semibold hover:underline">Ver detalhes</button>
            </DashboardCard>
            <DashboardCard icon={<Mail size={28} />} title="Mensagens" delay={0.18} bgColor="#E8F5E9">
              <div className="text-base text-[#2B2B2B] mb-2">Última: <span className="font-medium">{evento.ultimaMensagem}</span></div>
              <button className="text-[#B87D8A] font-semibold hover:underline">Ir ao mural</button>
            </DashboardCard> */}
          </div>
        </section>
        {/* Ações rápidas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold text-[#B87D8A] mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <QuickActionButton icon={<Plus />} >Adicionar Convidado</QuickActionButton>
            <QuickActionButton icon={<Gift />} >Adicionar Presente</QuickActionButton>
            <QuickActionButton icon={<Edit3 />} >Editar Informações</QuickActionButton>
          </div>
        </motion.section>
        {/* Linha do tempo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-[#B87D8A] mb-4">Linha do Tempo</h3>
          <div className="relative pl-6 border-l-2 border-[#F3F0FF] space-y-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-[#B87D8A] to-[#F3C6C6] text-white rounded-full p-2 flex items-center justify-center mt-1 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[#2B2B2B] text-base">{item.text}</div>
                  <div className="text-xs text-[#B87D8A]">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
} 