'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PricingCard({ title, price, features }: { title: string; price: string; features: string[] }) {
  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h3 className="text-2xl font-bold text-[#863F44]">{title}</h3>
        <p className="text-3xl font-bold my-4">{price}</p>
        <ul className="space-y-2 text-gray-600">
          {features.map((feature, idx) => (
            <li key={idx}>• {feature}</li>
          ))}
        </ul>
      </div>
      <Link href="/signup">
        <motion.a
          className="mt-4 inline-block px-4 py-2 bg-[#863F44] text-white rounded-lg hover:shadow-xl transition"
          whileHover={{ scale: 1.05 }}
        >
          Escolher plano
        </motion.a>
      </Link>
    </motion.div>
  );
}