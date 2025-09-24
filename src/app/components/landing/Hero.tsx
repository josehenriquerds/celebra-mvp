"use client";

import { motion } from "framer-motion";
import PathMorphing from "./PathMorphing";
import EventTextMorphing from "./EventTextMorphing";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-28 pb-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        {/* Texto */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-center lg:text-left"
        >
          <h1
  
  className="text-8xl flex items-baseline gap-3 flex-wrap leading-tight tracking-tight"
>
  <span className="text-primary" style={{ fontFamily: '"Nova Slim", sans-serif' }}>Celebre, </span>
  <EventTextMorphing />
</h1>


          <p className="text-lg text-textSecondary max-w-lg mx-auto lg:mx-0">
            E Deixe o resto com a gente. Nós cuidamos da experiência do início ao fim.
          </p>

          <div>
            <Link href="/login">
              <button className="px-6 py-3 bg-[#863F44] text-white font-bold rounded-2xl shadow-lg hover:brightness-110 hover:scale-105 transition-all duration-300 ease-out">
                Começar Agora
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Morphing */}
        <div className="flex justify-center">
          <PathMorphing />
        </div>
      </div>
    </section>
  );
}
