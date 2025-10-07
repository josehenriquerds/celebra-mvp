'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBingoStore } from '../state/useBingoStore';

export function HostPanel() {
  const { config, drawEngine, initDrawEngine, drawNumber, resetDraw } = useBingoStore();
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!drawEngine) {
      initDrawEngine();
    }
  }, [drawEngine, initDrawEngine]);

  const handleDraw = () => {
    if (isAnimating || !drawEngine?.hasMore()) return;

    setIsAnimating(true);
    const number = drawNumber();

    if (number !== null) {
      setLastNumber(number);
      setDrawnNumbers((prev) => [...prev, number]);

      // Som opcional (implementar depois)
      // playSound(number);

      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleReset = () => {
    resetDraw();
    setDrawnNumbers([]);
    setLastNumber(null);
    setIsAnimating(false);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleDraw();
      } else if (e.code === 'KeyR') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating, drawEngine]);

  return (
    <div className="space-y-6">
      {/* Número Atual */}
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-500">Último Número Sorteado</p>
          <AnimatePresence mode="wait">
            {lastNumber !== null ? (
              <motion.div
                key={lastNumber}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto flex size-40 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl"
              >
                <span className="text-7xl font-bold text-white">{lastNumber}</span>
              </motion.div>
            ) : (
              <div className="mx-auto flex size-40 items-center justify-center rounded-full bg-gray-200">
                <span className="text-xl text-gray-400">-</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Controles */}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            size="lg"
            onClick={handleDraw}
            disabled={!drawEngine?.hasMore() || isAnimating}
            className="gap-2 px-8"
          >
            <Play className="size-5" />
            Sortear (Espaço)
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="size-5" />
            Reset (R)
          </Button>
        </div>

        {/* Status */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {drawEngine ? (
              <>
                <span className="font-semibold">{drawnNumbers.length}</span> sorteados •{' '}
                <span className="font-semibold">{drawEngine.getAvailable().length}</span> restantes
              </>
            ) : (
              'Inicializando...'
            )}
          </p>
        </div>
      </div>

      {/* Histórico */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Volume2 className="size-5" />
          Histórico
        </h3>
        <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
          {drawnNumbers.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum número sorteado ainda</p>
          ) : (
            drawnNumbers.map((num, index) => (
              <motion.div
                key={`${num}-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    'text-base px-3 py-1',
                    num === lastNumber && 'bg-purple-100 border-purple-300'
                  )}
                >
                  {num}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
