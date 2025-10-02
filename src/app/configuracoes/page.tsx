'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  CheckCircle,
  MessageCircle,
  Shirt,
} from 'lucide-react'

export default function ConfiguracoesEvento() {
  const [form, setForm] = useState({
    nome: 'Casamento de Davi & Bia',
    data: '2025-08-15',
    hora: '17:00',
    local: 'Vitória/ES',
    traje: 'Social completo',
    capa: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    rsvp: true,
    mural: true,
  })
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target
    const { name, value, type } = target
    if (type === 'checkbox' && target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setTimeout(() => {
      setSalvando(false)
      setToast('Configurações salvas com sucesso!')
      setTimeout(() => setToast(null), 1800)
    }, 1200)
  }

  return (
    <div className="font-[\'Nova Slim\',sans-serif] flex min-h-screen items-start justify-center bg-[#FFF9FB] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex w-full max-w-2xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-lg md:p-12"
      >
        <h1 className="font-heading mb-2 flex items-center gap-2 text-3xl font-semibold text-[#863F44]">
          <CheckCircle size={28} className="text-[#B87D8A]" /> Configurações do Evento
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nome do evento */}
          <div className="col-span-1 flex flex-col gap-1 md:col-span-2">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="nome">
              <CheckCircle size={18} /> Nome do evento
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome do evento"
              className="mt-1 rounded-lg border px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Data */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="data">
              <Calendar size={18} /> Data
            </label>
            <input
              id="data"
              name="data"
              type="date"
              value={form.data}
              onChange={handleChange}
              className="mt-1 rounded-lg border px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Hora */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="hora">
              <Clock size={18} /> Horário
            </label>
            <input
              id="hora"
              name="hora"
              type="time"
              value={form.hora}
              onChange={handleChange}
              className="mt-1 rounded-lg border px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Local */}
          <div className="col-span-1 flex flex-col gap-1 md:col-span-2">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="local">
              <MapPin size={18} /> Endereço/local
            </label>
            <input
              id="local"
              name="local"
              type="text"
              value={form.local}
              onChange={handleChange}
              placeholder="Endereço do evento"
              className="mt-1 rounded-lg border px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Traje */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="traje">
              <Shirt size={18} /> Traje
            </label>
            <select
              id="traje"
              name="traje"
              value={form.traje}
              onChange={handleChange}
              className="mt-1 rounded-lg border px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
            >
              <option value="Social completo">Social completo</option>
              <option value="Esporte fino">Esporte fino</option>
              <option value="Casual">Casual</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          {/* Imagem de capa */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="capa">
              <ImageIcon size={18} /> Imagem de capa
            </label>
            <input
              id="capa"
              name="capa"
              type="url"
              value={form.capa}
              onChange={handleChange}
              placeholder="URL da imagem de capa"
              className="mt-1 rounded-lg border px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
            />
            {form.capa && (
              <img
                src={form.capa}
                alt="Capa do evento"
                className="mt-2 h-32 w-full rounded-lg border object-cover"
              />
            )}
          </div>
          {/* RSVP toggle */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="rsvp">
              <CheckCircle size={18} /> Ativar Confirmação de Presença (RSVP)
            </label>
            <input
              id="rsvp"
              name="rsvp"
              type="checkbox"
              checked={form.rsvp}
              onChange={handleChange}
              className="mt-2 h-6 w-6 accent-[#863F44]"
            />
          </div>
          {/* Mural toggle */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 font-medium text-[#863F44]" htmlFor="mural">
              <MessageCircle size={18} /> Ativar Mural de Mensagens
            </label>
            <input
              id="mural"
              name="mural"
              type="checkbox"
              checked={form.mural}
              onChange={handleChange}
              className="mt-2 h-6 w-6 accent-[#863F44]"
            />
          </div>
          {/* Botão salvar */}
          <div className="col-span-1 mt-4 flex justify-end md:col-span-2">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.04 }}
              disabled={salvando}
              className="rounded-xl bg-[#863F44] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#B87D8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </motion.button>
          </div>
        </form>
        {/* Toast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={toast ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#863F44] px-6 py-3 text-base font-medium text-white shadow-lg ${toast ? '' : 'pointer-events-none'}`}
        >
          {toast}
        </motion.div>
      </motion.div>
    </div>
  )
}
