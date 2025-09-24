"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Image as ImageIcon, CheckCircle, MessageCircle, Shirt } from "lucide-react";

export default function ConfiguracoesEvento() {
  const [form, setForm] = useState({
    nome: "Casamento de Davi & Bia",
    data: "2025-08-15",
    hora: "17:00",
    local: "Vitória/ES",
    traje: "Social completo",
    capa: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    rsvp: true,
    mural: true,
  });
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target;
    const { name, value, type } = target;
    if (type === "checkbox" && target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      setToast("Configurações salvas com sucesso!");
      setTimeout(() => setToast(null), 1800);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#FFF9FB] font-[\'Nova Slim\',sans-serif] px-4 py-10 flex justify-center items-start">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-12 flex flex-col gap-8"
      >
        <h1 className="text-3xl font-heading font-semibold text-[#863F44] mb-2 flex items-center gap-2">
          <CheckCircle size={28} className="text-[#B87D8A]" /> Configurações do Evento
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome do evento */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="nome"><CheckCircle size={18} /> Nome do evento</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome do evento"
              className="border rounded-lg px-4 py-2 mt-1 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Data */}
          <div className="flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="data"><Calendar size={18} /> Data</label>
            <input
              id="data"
              name="data"
              type="date"
              value={form.data}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 mt-1 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Hora */}
          <div className="flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="hora"><Clock size={18} /> Horário</label>
            <input
              id="hora"
              name="hora"
              type="time"
              value={form.hora}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 mt-1 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Local */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="local"><MapPin size={18} /> Endereço/local</label>
            <input
              id="local"
              name="local"
              type="text"
              value={form.local}
              onChange={handleChange}
              placeholder="Endereço do evento"
              className="border rounded-lg px-4 py-2 mt-1 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
              required
            />
          </div>
          {/* Traje */}
          <div className="flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="traje"><Shirt size={18} /> Traje</label>
            <select
              id="traje"
              name="traje"
              value={form.traje}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 mt-1 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
            >
              <option value="Social completo">Social completo</option>
              <option value="Esporte fino">Esporte fino</option>
              <option value="Casual">Casual</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          {/* Imagem de capa */}
          <div className="flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="capa"><ImageIcon size={18} /> Imagem de capa</label>
            <input
              id="capa"
              name="capa"
              type="url"
              value={form.capa}
              onChange={handleChange}
              placeholder="URL da imagem de capa"
              className="border rounded-lg px-4 py-2 mt-1 outline-none transition-all focus:ring-2 focus:ring-[#B87D8A]"
            />
            {form.capa && (
              <img src={form.capa} alt="Capa do evento" className="w-full h-32 object-cover rounded-lg mt-2 border" />
            )}
          </div>
          {/* RSVP toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="rsvp"><CheckCircle size={18} /> Ativar Confirmação de Presença (RSVP)</label>
            <input
              id="rsvp"
              name="rsvp"
              type="checkbox"
              checked={form.rsvp}
              onChange={handleChange}
              className="w-6 h-6 accent-[#863F44] mt-2"
            />
          </div>
          {/* Mural toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-[#863F44] font-medium flex items-center gap-2" htmlFor="mural"><MessageCircle size={18} /> Ativar Mural de Mensagens</label>
            <input
              id="mural"
              name="mural"
              type="checkbox"
              checked={form.mural}
              onChange={handleChange}
              className="w-6 h-6 accent-[#863F44] mt-2"
            />
          </div>
          {/* Botão salvar */}
          <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.04 }}
              disabled={salvando}
              className="px-6 py-3 bg-[#863F44] text-white font-semibold rounded-xl shadow-md hover:bg-[#B87D8A] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando..." : "Salvar Configurações"}
            </motion.button>
          </div>
        </form>
        {/* Toast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={toast ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#863F44] text-white px-6 py-3 rounded-xl shadow-lg z-50 font-medium text-base ${toast ? '' : 'pointer-events-none'}`}
        >
          {toast}
        </motion.div>
      </motion.div>
    </div>
  );
} 