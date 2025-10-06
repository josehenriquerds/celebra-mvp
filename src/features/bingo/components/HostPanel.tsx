'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Volume2 } from 'lucide-react';
import { useBingoStore } from '../state/useBingoStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Último Número Sorteado</p>
          <AnimatePresence mode="wait">
            {lastNumber !== null ? (
              <motion.div
                key={lastNumber}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
              >
                <span className="text-7xl font-bold text-white">{lastNumber}</span>
              </motion.div>
            ) : (
              <div className="w-40 h-40 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xl">-</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Controles */}
        <div className="flex gap-3 mt-8 justify-center">
          <Button
            size="lg"
            onClick={handleDraw}
            disabled={!drawEngine?.hasMore() || isAnimating}
            className="gap-2 px-8"
          >
            <Play className="w-5 h-5" />
            Sortear (Espaço)
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
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
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Histórico
        </h3>
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {drawnNumbers.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum número sorteado ainda</p>
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
