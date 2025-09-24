"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2, Image as ImageIcon, User, Smile, Heart, PartyPopper, Star } from "lucide-react";

interface Mensagem {
  id: number;
  nome: string;
  texto: string;
  data: string;
  reacoes: { [emoji: string]: number };
  imagem?: string;
}

const MOCK_MENSAGENS: Mensagem[] = [
  { id: 1, nome: "Ana Paula", texto: "Parabéns aos noivos! 🎉", data: "2024-06-10 19:30", reacoes: { "❤️": 2, "🎉": 1 } },
  { id: 2, nome: "Carlos Silva", texto: "Que seja um dia inesquecível! 🥂", data: "2024-06-10 20:10", reacoes: { "🥂": 1 } },
  { id: 3, nome: "Convidado Anônimo", texto: "Felicidades sempre!", data: "2024-06-11 09:00", reacoes: { "❤️": 1 } },
];

const EMOJIS = ["❤️", "🎉", "🥂", "⭐"];

export default function MensagensPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(MOCK_MENSAGENS);
  const [novaMsg, setNovaMsg] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [nomeAutor, setNomeAutor] = useState("José (Anfitrião)");
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resumo = {
    total: mensagens.length,
    ultima: mensagens[mensagens.length - 1],
  };

  function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!novaMsg.trim()) return;
    setEnviando(true);
    setTimeout(() => {
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now(),
          nome: nomeAutor || "Convidado Anônimo",
          texto: novaMsg,
          data: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
          reacoes: {},
          imagem: imagem || undefined,
        },
      ]);
      setNovaMsg("");
      setImagem(null);
      setEnviando(false);
    }, 600);
  }

  function handleReagir(id: number, emoji: string) {
    setMensagens((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, reacoes: { ...m.reacoes, [emoji]: (m.reacoes[emoji] || 0) + 1 } }
          : m
      )
    );
  }

  function handleExcluir(id: number) {
    if (window.confirm("Deseja excluir esta mensagem?")) {
      setMensagens((prev) => prev.filter((m) => m.id !== id));
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagem(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF9FB] font-[\'Nova Slim\',sans-serif] px-4 py-8 max-w-3xl mx-auto">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-heading font-semibold text-[#863F44] mb-6 flex items-center gap-2"><MessageCircle size={28} /> Mensagens do Evento</motion.h1>
      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-1">
          <span className="text-[#B87D8A] text-sm font-medium">Total de mensagens</span>
          <span className="text-2xl font-bold text-[#863F44]">{resumo.total}</span>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-1">
          <span className="text-[#B87D8A] text-sm font-medium">Última recebida</span>
          <span className="text-base font-semibold text-[#2B2B2B] flex items-center gap-2">
            {resumo.ultima?.texto} {resumo.ultima?.texto.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u) && <Smile size={18} className="text-[#B87D8A]" />}
          </span>
          <span className="text-xs text-[#6B6B6B]">{resumo.ultima?.data}</span>
        </div>
      </div>
      {/* Nova mensagem */}
      <motion.form onSubmit={handleEnviar} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <User size={20} className="text-[#B87D8A]" />
          <input
            type="text"
            value={nomeAutor}
            onChange={e => setNomeAutor(e.target.value)}
            className="bg-[#F3E8EE] rounded px-3 py-1 text-[#863F44] font-medium outline-none w-48"
            placeholder="Seu nome"
          />
        </div>
        <textarea
          value={novaMsg}
          onChange={e => setNovaMsg(e.target.value)}
          className="border rounded-lg px-4 py-2 min-h-[60px] resize-none outline-none"
          placeholder="Escreva uma mensagem para o mural..."
          maxLength={300}
          required
        />
        {imagem && (
          <div className="flex items-center gap-2">
            <img src={imagem} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
            <button type="button" onClick={() => setImagem(null)} className="text-xs text-[#B87D8A] underline">Remover</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F3E8EE] text-[#863F44] font-medium hover:bg-[#F3C6C6] transition-all">
            <ImageIcon size={18} /> Imagem
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button type="submit" disabled={enviando || !novaMsg.trim()} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-[#863F44] text-white font-semibold rounded-xl shadow-md hover:bg-[#B87D8A] hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            <Send size={18} /> Enviar Mensagem
          </button>
        </div>
      </motion.form>
      {/* Feed de mensagens */}
      <div className="flex flex-col gap-5">
        <AnimatePresence initial={false}>
          {mensagens.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-[#B87D8A] py-12">Nenhuma mensagem ainda.</motion.div>
          )}
          {mensagens.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 relative"
            >
              <div className="flex items-center gap-2 mb-1">
                <User size={18} className="text-[#B87D8A]" />
                <span className="font-semibold text-[#2B2B2B]">{msg.nome || "Convidado Anônimo"}</span>
                <span className="ml-auto text-xs text-[#6B6B6B]">{msg.data}</span>
                <button onClick={() => handleExcluir(msg.id)} className="ml-2 p-1 rounded hover:bg-[#F3E8EE] transition" title="Excluir"><Trash2 size={16} className="text-[#B87D8A]" /></button>
              </div>
              <div className="text-[#2B2B2B] text-base whitespace-pre-line">{msg.texto}</div>
              {msg.imagem && <img src={msg.imagem} alt="Imagem da mensagem" className="w-32 h-32 object-cover rounded-lg border mt-2" />}
              <div className="flex gap-2 mt-1">
                {EMOJIS.map((emoji) => (
                  <button key={emoji} onClick={() => handleReagir(msg.id, emoji)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F3E8EE] text-[#863F44] text-sm font-medium hover:bg-[#F3C6C6] transition-all">
                    <span>{emoji}</span>
                    {msg.reacoes[emoji] > 0 && <span>{msg.reacoes[emoji]}</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 