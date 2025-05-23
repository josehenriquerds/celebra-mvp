'use client';
import { motion } from 'framer-motion';

const projects = [
  { title: 'Plataforma Celebra Cloud', desc: 'Gerencie múltiplos eventos com desempenho e escalabilidade.', link: '#' },
  { title: 'App de Gestão Inteligente', desc: 'Controle convites e RSVPs em tempo real via mobile.', link: '#' },
  { title: 'E-commerce de Presentes', desc: 'Venda lembranças personalizáveis para convidados.', link: '#' }
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading text-textPrimary mb-4">Portfólio</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {projects.map((p, i) => (
            <motion.a key={i} href={p.link} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.2 }} className="group block p-6 bg-secondary rounded-lg shadow-lg hover:shadow-2xl transition">
              <h3 className="text-xl font-medium text-primary mb-2 group-hover:underline">{p.title}</h3>
              <p className="text-textSecondary">{p.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}