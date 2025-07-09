'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'

const faqs = [
  {
    question: 'É possível personalizar meu convite?',
    answer: 'Sim! Você pode editar o texto, cores e até adicionar fotos no seu convite.',
  },
  {
    question: 'Como envio os convites?',
    answer: 'Você pode enviar por WhatsApp, e-mail ou copiar o link direto para compartilhar.',
  },
  {
    question: 'Existe versão gratuita?',
    answer: 'Sim, o plano gratuito inclui modelos básicos e envio ilimitado de convites digitais.',
  },
]

const EmailFaq = () => {
  return (
    <section className="flex-col flexCenter overflow-hidden bg-feature-bg bg-center bg-no-repeat py-24">
      <div className="max-container padding-container relative w-full flex flex-col lg:flex-row justify-between gap-10">
        {/* Lado esquerdo: E-mail */}
        <div className="z-20 flex flex-col justify-center bg-white/70 backdrop-blur-lg p-10 rounded-3xl shadow-md w-full lg:w-[45%]">
          <h2 className="bold-32 lg:bold-40 mb-4 text-[#F2B7B6]">Receba novidades</h2>
          <p className="regular-16 text-gray-600 mb-6">
            Cadastre seu e-mail e receba conteúdos exclusivos para organizar seu evento com facilidade.
          </p>
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F2B7B6]"
          />
          <button className="bg-[#F2B7B6] text-white rounded-lg py-3 px-5 font-semibold hover:bg-[#6e2f36] transition mt-4 w-fit">
            Quero receber
          </button>
        </div>

        {/* Lado direito: FAQ */}
        <div className="z-20 flex flex-col justify-center bg-white/70 backdrop-blur-lg p-10 rounded-3xl shadow-md w-full lg:w-[50%]">
          <h2 className="bold-32 lg:bold-40 mb-4 text-[#F2B7B6]">Perguntas Frequentes</h2>
          <ul className="space-y-4">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false)

  return (
    <li className="border-gray-300 pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left py-2"
      >
        <span className="bold-16 text-[#F2B7B6]">{question}</span>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#F2B7B6] ml-2"
        >
          ▶
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            key="faq-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="regular-14 mt-2 text-gray-600"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </li>
  )
}

export default EmailFaq
