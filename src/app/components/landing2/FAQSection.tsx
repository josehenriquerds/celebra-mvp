'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react'; // ou outro ícone de sua preferência

const FAQS = [
  { question: "Posso mudar de plano?", answer: "Sim, você pode trocar de plano a qualquer momento, sem burocracia." },
  { question: "Meus dados são seguros?", answer: "Sim! Utilizamos criptografia avançada e seguimos as melhores práticas do setor." },
  { question: "Tem suporte no dia?", answer: "Claro! Nosso suporte é dedicado e acompanha seu evento de perto." }
];

export default function FAQAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="space-y-2 w-full" defaultValue="">
      {FAQS.map((item, idx) => (
        <Accordion.Item key={idx} value={`item-${idx}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow shadow-sm hover:shadow-lg">
          <Accordion.Header>
            <Accordion.Trigger asChild>
              <button
                className="flex w-full items-center justify-between gap-2 p-4 text-lg font-semibold text-[#863F44] transition-colors hover:bg-pink-50 focus:outline-none"
                aria-expanded="false"
              >
                {item.question}
                <Accordion.Trigger asChild>
                  <motion.span
                    initial={false}
                    animate={{ rotate: [0, 180] }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-[#863F44]" />
                  </motion.span>
                </Accordion.Trigger>
              </button>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content asChild>
            <AnimatePresence initial={false}>
              <motion.div
                key={`answer-${idx}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="pl-4 pr-6 pb-4 text-base text-gray-600"
              >
                {item.answer}
              </motion.div>
            </AnimatePresence>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
