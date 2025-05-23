'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero2() {
  return (
    <section className="py-16 px-6 md:px-12 flex flex-col-reverse md:flex-row items-center justify-between bg-white">
      <motion.div
        className="md:w-1/2 mt-8 md:mt-0"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Image
          src="/images/Ocellaris.svg"
          alt="Celebrando Eventos"
          width={500}
          height={400}
          className="mx-auto"
        />
      </motion.div>
      <motion.div
        className="md:w-1/2"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900">
          Tudo para seu evento em um só lugar
        </h1>
        <p className="mt-4 text-base md:text-lg text-gray-600">
          Planeje, convide e acompanhe cada detalhe com facilidade e eficiência.
        </p>
        <Link href="/signup">
          <motion.a
            className="inline-block mt-6 px-8 py-3 bg-[#863F44] text-white rounded-full font-semibold hover:shadow-xl transition"
            whileHover={{ scale: 1.05 }}
          >
            Cadastre-se agora
          </motion.a>
        </Link>
      </motion.div>
    </section>
  );
}