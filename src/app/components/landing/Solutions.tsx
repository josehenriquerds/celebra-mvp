'use client';
import { motion } from 'framer-motion';

const solutions = [
  { title: 'Desenvolvimento Personalizado', desc: 'Sistemas sob medida para seu evento, com interface intuitiva.' },
  { title: 'Automação & Eficiência', desc: 'Envio automático de convites e lembretes, sem esforço manual.' },
  { title: 'Integração Digital', desc: 'Conecte WhatsApp, e-mail e redes sociais em um só lugar.' }
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading text-textPrimary mb-4">Nossas Principais Soluções</h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }} className="mt-8 grid gap-8 md:grid-cols-3">
          {solutions.map((s, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-secondary rounded-lg shadow-lg">
              <h3 className="text-xl font-medium text-primary mb-2">{s.title}</h3>
              <p className="text-textSecondary">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}