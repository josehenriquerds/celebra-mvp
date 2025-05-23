'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      className="text-center p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image src={icon} alt={title} width={50} height={50} className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-[#863F44]">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </motion.div>
  );
}