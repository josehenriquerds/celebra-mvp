'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const conversations = [
  {
    question: 'Quantos convidados confirmaram?',
    responses: ['Olá Rodrigues, 128 confirmaram', 'Gostaria de notificar os que ainda não confirmaram?'],
  },
  {
    question: 'Qual o horário do evento?',
    responses: ['Às 18h no Espaço Luar', 'Deseja enviar um lembrete?'],
  },
  {
    question: 'Alguém com restrição alimentar?',
    responses: ['3 convidados informaram preferência vegana', 'Já atualizei a lista!'],
  },
]

export default function AnimatedChat() {
  const [index, setIndex] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [visibleResponses, setVisibleResponses] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(true)

  const current = conversations[index]

  useEffect(() => {
    let typingTimeout: any
    let responsesTimeouts: any[] = []
    let resetTimeout: any

    // 1. Entrada (inicia com digitação)
    setShowTyping(true)
    setVisibleResponses([])
    setIsVisible(true)

    typingTimeout = setTimeout(() => {
      setShowTyping(false)

      current.responses.forEach((response, i) => {
        const t = setTimeout(() => {
          setVisibleResponses((prev) => [...prev, response])
        }, (i + 1) * 1200)
        responsesTimeouts.push(t)
      })
    }, 2000)

    // 2. Saída (apaga mensagens com delay em cascata)
    resetTimeout = setTimeout(() => {
      setIsVisible(false)
    }, 7000)

    // 3. Próxima conversa após tudo sumir
    const nextTimeout = setTimeout(() => {
      setIndex((prev) => (prev + 1) % conversations.length)
    }, 8500)

    return () => {
      clearTimeout(typingTimeout)
      responsesTimeouts.forEach(clearTimeout)
      clearTimeout(resetTimeout)
      clearTimeout(nextTimeout)
    }
  }, [index])

  return (
 <div
    className="relative w-full max-w-[380px] min-h-[280px] h-auto rounded-3xl bg-[#FAFCFB] px-4 py-6 shadow-xl border border-gray-200 overflow-hidden transition-all duration-500
      before:absolute before:-left-2 before:top-6 before:h-3 before:w-3 before:bg-[#FAFCFB] before:rotate-45 before:rounded-sm before:border-l before:border-t before:border-gray-200"
  >
<div
    className="absolute bg-[#FAFCFB] border-l border-t border-gray-200"
    style={{
      top: '24px',
      left: '-8px',
      width: '12px',
      height: '12px',
      transform: 'rotate(45deg)',
      borderTopLeftRadius: '2px',
    }}
  />
  <p className="text-lg text-center text-gray-400 mb-4">Cele</p>

        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key={current.question}
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              {/* Pergunta principal (verde) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="flex justify-end"
              >
                <div className="relative max-w-[80%] bg-[#E8F0D5] text-black text-sm px-4 py-2 rounded-[22px] shadow-md">
                  {current.question}
                  <div
                    className="absolute bg-[#E8F0D5]"
                    style={{
                      bottom: '0.25px',
                      right: '1.5px',
                      width: '15.75px',
                      height: '15.75px',
                      borderBottomLeftRadius: '8px',
                      transform: 'rotate(90deg)',
                    }}
                  />
                </div>
              </motion.div>

              {/* Digitando... */}
              {showTyping && (
                <div className="flex items-center gap-1 pl-2">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Respostas animadas com delays e saída fluida */}
              <div className="flex flex-col justify-start gap-4">
                <AnimatePresence>
                  {visibleResponses.map((text, idx) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="flex justify-start"
                    >
                      <div className="relative max-w-[80%] bg-[#D0E1E8] text-black text-sm px-4 py-2 rounded-[22px] shadow-md">
                        {text}
                        <div
                          className="absolute bg-[#D0E1E8]"
                          style={{
                            bottom: '0.25px',
                            left: '0.5px',
                            width: '15.75px',
                            height: '15.75px',
                            borderBottomRightRadius: '8px',
                            transform: 'rotate(90deg)',
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  )
}
