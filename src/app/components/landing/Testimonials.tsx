'use client';
import { motion } from 'framer-motion';

const testimonials = [
  { name: 'Emily Chen', text: 'Excelente plataforma que tornou nosso planejamento muito mais fácil!', role: 'Noiva' },
  { name: 'Michael Johnson', text: 'As funcionalidades de RSVP são impressionantes e confiáveis.', role: 'Cerimonialista' },
  { name: 'Sarah Thompson', text: 'A automação de mensagens salvou meu tempo e garantiu confirmações rápidas.', role: 'Convidada' }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading text-textPrimary mb-4">Depoimentos de Clientes</h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }} className="mt-8 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-white rounded-lg shadow-lg">
              <p className="text-textSecondary mb-4">"{t.text}"</p>
              <div className="font-medium text-primary">{t.name}</div>
              <div className="text-sm text-textSecondary">{t.role}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
