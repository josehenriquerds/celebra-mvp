'use client';
import { motion } from 'framer-motion';

export default function PortfolioSection({ items }: { items: { title: string; description: string }[] }) {
  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <h2 className="text-3xl font-serif font-bold text-center mb-12">Nossos Resultados</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="p-6 shadow-md rounded-lg bg-[#FAF9F7]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <h3 className="text-xl font-semibold text-[#863F44]">{item.title}</h3>
            <p className="mt-2 text-gray-600">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}