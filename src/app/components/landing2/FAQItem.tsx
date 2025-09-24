import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Aqui você integraria com seu backend ou serviço de e-mail marketing
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
    setEmail('');
  }

  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center relative"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <h2 className="font-serif text-2xl font-bold mb-4 text-center">Receba o Checklist Completo</h2>
      <p className="text-gray-600 text-center mb-6">Garanta seu evento sem esquecer nenhum detalhe. Baixe grátis o checklist que ajuda centenas de anfitriões!</p>
      <Image
        src="/images/bride.jpg"
        width={140}
        height={140}
        alt="Noiva elegante"
        className="rounded-full object-cover mb-4 shadow-lg border-4 border-pink-100"
      />
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          id="email"
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
          placeholder="Seu e-mail"
          type="email"
          autoComplete="email"
          required
        />
        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: '#FADADD' }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="bg-pink-200 text-[#863F44] py-3 w-full rounded-full hover:bg-pink-300 font-semibold transition"
        >
          Baixar Checklist Grátis
        </motion.button>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-green-700 bg-green-100 mt-2 p-2 rounded"
          >
            Sucesso! Checklist enviado para seu e-mail.
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
