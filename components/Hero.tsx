"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedChat from "./AnimatedChat";
import CelebrateButton from "./CelebrateButton";

const phrases = [
  { text: "Casamento", color: "#FFECCF" },
  { text: "Aniversário", color: "#7A9C57" },
  { text: "Formatura", color: "#A2C6D8" },
  { text: "Chá de bebê", color: "#f2b7b6" },
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-container padding-container flex flex-col gap-20 py-10 pb-32 md:gap-28 lg:py-20 xl:flex-row">
      <div className="hero-map" />

      <div className="relative z-20 flex flex-1 flex-col xl:w-1/2">
        <h1 className="bold-52 lg:bold-88">Celebre,</h1>

        <div className="h-[90px] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.h2
              key={phrases[index].text}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 1.2 }}
              className="bold-52 lg:bold-88 absolute w-full"
              style={{ color: phrases[index].color }}
            >
              {phrases[index].text}
            </motion.h2>
          </AnimatePresence>
        </div>

        <p className="regular-16 mt-6 text-gray-30 xl:max-w-[520px]">
          Organize casamentos, aniversários e eventos inesquecíveis com
          praticidade e estilo. Com o Celebre, você planeja cada detalhe, envia
          convites personalizados e encanta seus convidados — tudo em um só
          lugar.
        </p>

        <div className="flex flex-col w-full gap-3 sm:flex-row mt-12">
          <CelebrateButton />
        </div>
      </div>

      <div className="relative flex flex-1 items-start">
        <AnimatedChat />
      </div>
    </section>
  );
};

export default Hero;
