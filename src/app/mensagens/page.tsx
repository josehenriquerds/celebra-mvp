'use client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Trash2,
  Image as ImageIcon,
  User,
  Smile,
} from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'

interface Mensagem {
  id: number
  nome: string
  texto: string
  data: string
  reacoes: { [emoji: string]: number }
  imagem?: string
}

const MOCK_MENSAGENS: Mensagem[] = [
  {
    id: 1,
    nome: 'Ana Paula',
    texto: 'Parabéns aos noivos! 🎉',
    data: '2024-06-10 19:30',
    reacoes: { '❤️': 2, '🎉': 1 },
  },
  {
    id: 2,
    nome: 'Carlos Silva',
    texto: 'Que seja um dia inesquecível! 🥂',
    data: '2024-06-10 20:10',
    reacoes: { '🥂': 1 },
  },
  {
    id: 3,
    nome: 'Convidado Anônimo',
    texto: 'Felicidades sempre!',
    data: '2024-06-11 09:00',
    reacoes: { '❤️': 1 },
  },
]

const EMOJIS = ['❤️', '🎉', '🥂', '⭐']

export default function MensagensPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(MOCK_MENSAGENS)
  const [novaMsg, setNovaMsg] = useState('')
  const [imagem, setImagem] = useState<string | null>(null)
  const [nomeAutor, setNomeAutor] = useState('José (Anfitrião)')
  const [enviando, setEnviando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resumo = {
    total: mensagens.length,
    ultima: mensagens[mensagens.length - 1],
  }

  function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!novaMsg.trim()) return
    setEnviando(true)
    setTimeout(() => {
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now(),
          nome: nomeAutor || 'Convidado Anônimo',
          texto: novaMsg,
          data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          reacoes: {},
          imagem: imagem || undefined,
        },
      ])
      setNovaMsg('')
      setImagem(null)
      setEnviando(false)
    }, 600)
  }

  function handleReagir(id: number, emoji: string) {
    setMensagens((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, reacoes: { ...m.reacoes, [emoji]: (m.reacoes[emoji] || 0) + 1 } } : m
      )
    )
  }

  function handleExcluir(id: number) {
    if (window.confirm('Deseja excluir esta mensagem?')) {
      setMensagens((prev) => prev.filter((m) => m.id !== id))
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagem(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="font-[\'Nova Slim\',sans-serif] mx-auto min-h-screen max-w-3xl bg-[#FFF9FB] px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-heading mb-6 flex items-center gap-2 text-3xl font-semibold text-[#863F44]"
      >
        <MessageCircle size={28} /> Mensagens do Evento
      </motion.h1>
      {/* Resumo */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-md">
          <span className="text-sm font-medium text-[#B87D8A]">Total de mensagens</span>
          <span className="text-2xl font-bold text-[#863F44]">{resumo.total}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-md">
          <span className="text-sm font-medium text-[#B87D8A]">Última recebida</span>
          <span className="flex items-center gap-2 text-base font-semibold text-[#2B2B2B]">
            {resumo.ultima?.texto}{' '}
            {resumo.ultima?.texto.match(
              /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u
            ) && <Smile size={18} className="text-[#B87D8A]" />}
          </span>
          <span className="text-xs text-[#6B6B6B]">{resumo.ultima?.data}</span>
        </div>
      </div>
      {/* Nova mensagem */}
      <motion.form
        onSubmit={handleEnviar}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="sticky top-0 z-20 mb-8 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-md"
      >
        <div className="flex items-center gap-2">
          <User size={20} className="text-[#B87D8A]" />
          <input
            type="text"
            value={nomeAutor}
            onChange={(e) => setNomeAutor(e.target.value)}
            className="w-48 rounded bg-[#F3E8EE] px-3 py-1 font-medium text-[#863F44] outline-none"
            placeholder="Seu nome"
          />
        </div>
        <textarea
          value={novaMsg}
          onChange={(e) => setNovaMsg(e.target.value)}
          className="min-h-[60px] resize-none rounded-lg border px-4 py-2 outline-none"
          placeholder="Escreva uma mensagem para o mural..."
          maxLength={300}
          required
        />
        {imagem && (
          <div className="flex items-center gap-2">
            <Image
              src={imagem}
              alt="Preview"
              width={64}
              height={64}
              className="size-16 rounded-lg border object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setImagem(null)}
              className="text-xs text-[#B87D8A] underline"
            >
              Remover
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded-lg bg-[#F3E8EE] px-3 py-2 font-medium text-[#863F44] transition-all hover:bg-[#F3C6C6]"
          >
            <ImageIcon size={18} /> Imagem
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="submit"
            disabled={enviando || !novaMsg.trim()}
            className="ml-auto flex items-center gap-2 rounded-xl bg-[#863F44] px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-[#B87D8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={18} /> Enviar Mensagem
          </button>
        </div>
      </motion.form>
      {/* Feed de mensagens */}
      <div className="flex flex-col gap-5">
        <AnimatePresence initial={false}>
          {mensagens.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center text-[#B87D8A]"
            >
              Nenhuma mensagem ainda.
            </motion.div>
          )}
          {mensagens.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="relative flex flex-col gap-2 rounded-xl bg-white p-4 shadow-md"
            >
              <div className="mb-1 flex items-center gap-2">
                <User size={18} className="text-[#B87D8A]" />
                <span className="font-semibold text-[#2B2B2B]">
                  {msg.nome || 'Convidado Anônimo'}
                </span>
                <span className="ml-auto text-xs text-[#6B6B6B]">{msg.data}</span>
                <button
                  onClick={() => handleExcluir(msg.id)}
                  className="ml-2 rounded p-1 transition hover:bg-[#F3E8EE]"
                  title="Excluir"
                >
                  <Trash2 size={16} className="text-[#B87D8A]" />
                </button>
              </div>
              <div className="whitespace-pre-line text-base text-[#2B2B2B]">{msg.texto}</div>
              {msg.imagem && (
                <Image
                  src={msg.imagem}
                  alt="Imagem da mensagem"
                  width={128}
                  height={128}
                  className="mt-2 size-32 rounded-lg border object-cover"
                  unoptimized
                />
              )}
              <div className="mt-1 flex gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReagir(msg.id, emoji)}
                    className="flex items-center gap-1 rounded-full bg-[#F3E8EE] px-2 py-1 text-sm font-medium text-[#863F44] transition-all hover:bg-[#F3C6C6]"
                  >
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
  )
}
