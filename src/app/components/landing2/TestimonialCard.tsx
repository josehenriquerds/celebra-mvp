'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface TestimonialCardProps {
  name: string;
  text: string;
  img: string;
}

export default function TestimonialCard({ name, text, img }: TestimonialCardProps) {
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src={img}
        alt={name}
        width={64}
        height={64}
        className="rounded-full border-2 border-[#863F44] mx-auto"
      />
      <p className="mt-4 italic text-gray-600">“{text}”</p>
      <h4 className="mt-2 font-bold text-[#863F44]">{name}</h4>
    </motion.div>
  );
}