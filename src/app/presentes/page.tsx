'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, User, Search, Edit3, Trash2, Plus, Link2 } from 'lucide-react'
import { useState } from 'react'

type StatusPresente = 'recebido' | 'reservado' | 'pendente'
interface Presente {
  id: number
  nome: string
  observacao?: string
  status: StatusPresente
  quem?: string
}

const STATUS = [
  { label: 'Todos', value: 'all' },
  { label: 'Recebido', value: 'recebido' },
  { label: 'Reservado', value: 'reservado' },
  { label: 'Pendente', value: 'pendente' },
]

const MOCK_PRESENTES: Presente[] = [
  {
    id: 1,
    nome: 'Jogo de Panelas',
    status: 'recebido',
    quem: 'Ana Paula',
    observacao: 'Marca Tramontina',
  },
  { id: 2, nome: 'Aparelho de Jantar', status: 'reservado', quem: 'Carlos Silva' },
  { id: 3, nome: 'Liquidificador', status: 'pendente' },
  { id: 4, nome: 'Faqueiro Inox', status: 'pendente' },
  { id: 5, nome: 'Jogo de Toalhas', status: 'recebido', quem: 'Beatriz Souza' },
]

const statusBadge: Record<StatusPresente, string> = {
  recebido: 'bg-green-100 text-green-700 border-green-200',
  reservado: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pendente: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function PresentesPage() {
  const [presentes, setPresentes] = useState<Presente[]>(MOCK_PRESENTES)
  const [filtro, setFiltro] = useState<string>('all')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Presente | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const filtrados = presentes.filter(
    (p) =>
      (filtro === 'all' || p.status === filtro) &&
      (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.observacao?.toLowerCase().includes(busca.toLowerCase()) ?? false))
  )

  const resumo = {
    total: presentes.length,
    recebido: presentes.filter((p) => p.status === 'recebido').length,
    reservado: presentes.filter((p) => p.status === 'reservado').length,
  }
  const progresso = Math.round(((resumo.recebido + resumo.reservado) / resumo.total) * 100)

  function abrirModalAdicionar() {
    setEditando(null)
    setModal(true)
  }

  function abrirModalEditar(presente: Presente) {
    setEditando(presente)
    setModal(true)
  }

  function removerPresente(id: number) {
    if (window.confirm('Tem certeza que deseja remover este presente?')) {
      setPresentes((prev) => prev.filter((p) => p.id !== id))
    }
  }

  function copiarLink(id: number) {
    navigator.clipboard.writeText(`${window.location.origin}/presente/${id}`)
    setToast('Link copiado!')
    setTimeout(() => setToast(null), 1500)
  }

  return (
    <div className="font-[\'Nova Slim\',sans-serif] mx-auto min-h-screen max-w-5xl bg-white px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-heading mb-6 flex items-center gap-2 text-3xl font-semibold text-[#863F44]"
      >
        <Gift size={28} /> Lista de Presentes
      </motion.h1>
      {/* Estatísticas e progresso */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="rounded-xl bg-[#F3E8EE] px-5 py-3 font-medium text-[#863F44] shadow-sm">
          Total: {resumo.total}
        </div>
        <div className="rounded-xl bg-green-100 px-5 py-3 font-medium text-green-700 shadow-sm">
          Recebidos: {resumo.recebido}
        </div>
        <div className="rounded-xl bg-yellow-100 px-5 py-3 font-medium text-yellow-700 shadow-sm">
          Reservados: {resumo.reservado}
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="mb-1 text-xs text-[#B87D8A]">Progresso</div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3E8EE]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progresso + '%' }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="h-2 rounded-full bg-gradient-to-r from-[#B87D8A] to-[#F3C6C6]"
            />
          </div>
        </div>
      </div>
      {/* Barra de ações */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <button
          onClick={abrirModalAdicionar}
          className="flex items-center gap-2 rounded-xl bg-[#863F44] px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-[#B87D8A]"
        >
          <Plus size={20} /> Adicionar Presente
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F3E8EE] px-4 py-2 shadow-sm">
          <Search size={18} className="text-[#863F44]" />
          <input
            type="text"
            placeholder="Buscar presente ou observação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-transparent text-[#863F44] outline-none placeholder:text-[#B87D8A]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFiltro(s.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${filtro === s.value ? 'border-[#863F44] bg-[#863F44] text-white' : 'border-[#F3E8EE] bg-[#F3E8EE] text-[#863F44] hover:bg-[#F3C6C6]'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {/* Cards responsivos */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <AnimatePresence>
          {filtrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-12 text-center text-[#B87D8A]"
            >
              Nenhum presente encontrado.
            </motion.div>
          )}
          {filtrados.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className="relative flex flex-col gap-3 rounded-xl border border-[#F3E8EE] bg-[#FFF9FB] p-5 shadow-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                <Gift size={22} className="text-[#B87D8A]" />
                <span className="text-lg font-semibold text-[#2B2B2B]">{p.nome}</span>
                <span
                  className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge[p.status]}`}
                >
                  {p.status === 'recebido'
                    ? 'Recebido'
                    : p.status === 'reservado'
                      ? 'Reservado'
                      : 'Pendente'}
                </span>
              </div>
              {p.observacao && <div className="text-sm italic text-[#B87D8A]">{p.observacao}</div>}
              {p.quem && (
                <div className="flex items-center gap-2 text-sm text-[#863F44]">
                  <User size={16} /> {p.quem}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => copiarLink(p.id)}
                  className="rounded p-2 transition hover:bg-[#F3E8EE]"
                  title="Compartilhar link"
                >
                  <Link2 size={18} className="text-[#863F44]" />
                </button>
                <button
                  onClick={() => abrirModalEditar(p)}
                  className="rounded p-2 transition hover:bg-[#F3E8EE]"
                  title="Editar"
                >
                  <Edit3 size={18} className="text-[#863F44]" />
                </button>
                <button
                  onClick={() => removerPresente(p.id)}
                  className="rounded p-2 transition hover:bg-[#F3E8EE]"
                  title="Excluir"
                >
                  <Trash2 size={18} className="text-[#B87D8A]" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Modal de adicionar/editar */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
            >
              <h2 className="mb-4 text-xl font-semibold text-[#863F44]">
                {editando ? 'Editar Presente' : 'Adicionar Presente'}
              </h2>
              {/* Formulário simplificado para exemplo */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setModal(false)
                }}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  placeholder="Nome do presente"
                  defaultValue={editando?.nome || ''}
                  className="rounded-lg border px-4 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Observação (opcional)"
                  defaultValue={editando?.observacao || ''}
                  className="rounded-lg border px-4 py-2"
                />
                <select
                  defaultValue={editando?.status || 'pendente'}
                  className="rounded-lg border px-4 py-2"
                >
                  <option value="recebido">Recebido</option>
                  <option value="reservado">Reservado</option>
                  <option value="pendente">Pendente</option>
                </select>
                <input
                  type="text"
                  placeholder="Quem confirmou (opcional)"
                  defaultValue={editando?.quem || ''}
                  className="rounded-lg border px-4 py-2"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="rounded-lg bg-[#F3E8EE] px-4 py-2 font-medium text-[#863F44]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#863F44] px-4 py-2 font-medium text-white"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#863F44] px-6 py-3 text-base font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
