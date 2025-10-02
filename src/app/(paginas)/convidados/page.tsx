'use client'
import { motion } from 'framer-motion'
import { Calendar, Users, Gift, Mail, Plus, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard'
import QuickActionButton from '../../components/QuickActionButton'
import Sidebar from '../../components/Sidebar'

const EVENTO = {
  nome: 'Casamento de Davi & Bia',
  data: '2025-08-15T17:00:00',
  local: 'Vitória/ES',
  confirmados: 120,
  total: 150,
  presentes: 35,
  mensagens: 4,
  ultimaMensagem: 'Parabéns aos noivos! 🎉',
}

const TIMELINE = [
  { icon: <Users size={18} />, text: 'Novo convidado adicionado: Ana Paula', date: '10/06/2024' },
  { icon: <Gift size={18} />, text: 'Presente recebido: Jogo de Panelas', date: '09/06/2024' },
  { icon: <Edit3 size={18} />, text: 'Informações do evento atualizadas', date: '08/06/2024' },
  { icon: <Mail size={18} />, text: 'Mensagem recebida de João', date: '07/06/2024' },
]

export default function Dashboard() {
  const [evento] = useState(EVENTO)
  const [timeline] = useState(TIMELINE)
  const percent = Math.round((evento.confirmados / evento.total) * 100)

  return (
    <div className="font-[\'Nova Slim\',sans-serif] grid min-h-screen grid-cols-[auto_1fr] bg-white">
      <Sidebar />
      <main className="ml-0 min-h-screen w-full bg-white px-4 py-8 md:ml-64 md:px-8 md:py-12">
        {/* Cabeçalho do evento */}
        <header className="mb-8 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B87D8A]">
            Resumo do Evento
          </span>
          <h1 className="font-[\'Nova Slim\',sans-serif] text-2xl font-[600] text-[#2B2B2B] md:text-3xl">
            {evento.nome}
          </h1>
          <div className="flex items-center gap-2 text-base text-[#6B6B6B]">
            <Calendar size={18} className="text-[#B87D8A]" />
            {new Date(evento.data).toLocaleDateString()} • {evento.local}
          </div>
        </header>
        {/* Cards informativos - layout fluido */}
        <section className="mb-10 flex flex-col gap-6 xl:flex-row">
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
          <h3 className="mb-4 text-xl font-semibold text-[#B87D8A]">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <QuickActionButton icon={<Plus />}>Adicionar Convidado</QuickActionButton>
            <QuickActionButton icon={<Gift />}>Adicionar Presente</QuickActionButton>
            <QuickActionButton icon={<Edit3 />}>Editar Informações</QuickActionButton>
          </div>
        </motion.section>
        {/* Linha do tempo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="mb-4 text-xl font-semibold text-[#B87D8A]">Linha do Tempo</h3>
          <div className="relative space-y-6 border-l-2 border-[#F3F0FF] pl-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 flex items-center justify-center rounded-full bg-gradient-to-br from-[#B87D8A] to-[#F3C6C6] p-2 text-white shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <div className="text-base text-[#2B2B2B]">{item.text}</div>
                  <div className="text-xs text-[#B87D8A]">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
