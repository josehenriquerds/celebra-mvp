'use client';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <motion.section
      id="cta"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-20 bg-secondary text-center"
    >
      <h2 className="text-3xl font-heading text-primary mb-4">Pronto para transformar seu evento?</h2>
      <p className="text-textSecondary mb-6">Solicite um orçamento gratuito e comece hoje mesmo!</p>
      <button className="px-6 py-3 bg-primary text-white font-medium rounded-md shadow hover:bg-accent transition">
        Solicitar Orçamento
      </button>
    </motion.section>
  );
}