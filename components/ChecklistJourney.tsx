// Atualização do componente ChecklistJourney com layout refinado e animações suaves

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  CheckCircle,
  CalendarClock,
  HeartHandshake
} from "lucide-react";

const checklistSteps = [
  {
    label: "Lista de Convidados",
    icon: Users,
    image: "/step1.png",
    detail: "Monte sua lista com praticidade e compartilhe com o Celebre."
  },
  {
    label: "Convites Personalizados",
    icon: Mail,
    image: "/step2.png",
    detail: "Crie convites elegantes e envie direto pelo WhatsApp."
  },
  {
    label: "Confirmações",
    icon: CheckCircle,
    image: "/step3.png",
    detail:
      "Acompanhe quem confirmou presença com atualização automática. tudo através do WhatsApp, tanto voce como seu convidado"
  },
  {
    label: "Organização do Evento",
    icon: CalendarClock,
    image: "/step4.png",
    detail: "Gerencie fornecedores, horários e mensagens com facilidade."
  },
  {
    label: "Dia do Casamento",
    icon: HeartHandshake,
    image: "/step5.png",
    detail: "Tudo pronto? Aproveite o grande dia com tranquilidade."
  }
];

export default function ChecklistJourney() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const totalSteps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const nextStepProgress = ((step + current / totalSteps) / (checklistSteps.length - 1)) * 100;
      setProgress(Math.min(nextStepProgress, 100));

      if (current >= totalSteps) {
        clearInterval(timer);
        setStep((prev) => (prev + 1) % checklistSteps.length);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [step]);

  return (
    <div className="relative w-full max-w-[1280px] mx-auto rounded-3xl overflow-hidden shadow-xl">
      <motion.div
        key={step}
        initial={{ opacity: 0.4, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[460px] md:h-[380px]"
      >
        <Image
          src={checklistSteps[step].image}
          alt={checklistSteps[step].label}
          fill
          className="object-cover object-center bg-white"
          priority
        />
      </motion.div>

      {/* Linha tracejada sobre a imagem */}
      <div className="absolute top-6 left-0 w-full px-4 z-10">
        <div className="relative w-full h-2">
          <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-white" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-[#F2B7B6]"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.05 }}
          />
        </div>

        {/* Etapas sobre a linha */}
        <div className="absolute -top-5 left-0 w-full flex justify-between items-center px-2">
          {checklistSteps.map((stepItem, i) => {
            const Icon = stepItem.icon;
            const isActive = i === step;
            return (
              <motion.div
                key={i}
                onClick={() => setStep(i)}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center cursor-pointer"
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-300 ${
                    i <= step
                      ? "bg-[#F2B7B6] text-white border-[#F2B7B6]"
                      : "bg-white text-gray-400 border-gray-300"
                  }`}
                >
                  <Icon size={18} />
                </motion.div>
                <p className="text-xs text-white mt-2 whitespace-nowrap">
                  {stepItem.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Texto descritivo centralizado */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full px-4">
        <motion.div
          key={checklistSteps[step].label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-xl text-center shadow-md max-w-xl mx-auto"
        >
          <p className="text-[#F2B7B6] font-semibold mb-2">{checklistSteps[step].label}</p>
          <p className="text-sm text-gray-700">{checklistSteps[step].detail}</p>
        </motion.div>
      </div>
    </div>
  );
}