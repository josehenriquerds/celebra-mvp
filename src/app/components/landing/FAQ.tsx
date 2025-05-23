'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const faqs = [
  { q: 'System requirements?', a: 'Funciona em desktop, tablet e mobile sem instalação adicional.' },
  { q: 'How to get started?', a: 'Basta criar uma conta gratuita e seguir o tutorial inicial.' },
  { q: 'Is it available for Linux?', a: 'Sim, funciona via navegador em qualquer sistema operacional.' },
  { q: 'What about a version for iOS?', a: 'Em breve teremos apps nativos para iOS.' },
  { q: 'Will I be automatically charged when my trial ends?', a: 'Não, você será notificado antes do término do trial.' }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-heading text-textPrimary text-center mb-4">Perguntas Frequentes</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="border-b">
              <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full flex justify-between items-center py-4 text-textPrimary">
                <span>{item.q}</span>
                <span className="transform transition-transform" style={{ transform: openIndex === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
              </button>
              {openIndex === idx && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.4 }} className="pb-4 text-textSecondary">
                  {item.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}