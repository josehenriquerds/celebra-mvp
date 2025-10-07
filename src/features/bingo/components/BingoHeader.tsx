'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BingoHeaderProps {
  title?: string;
  showTitle?: boolean;
  onTitleChange?: (title: string) => void;
  onToggleShow?: () => void;
  editable?: boolean;
  palette?: string;
}

export function BingoHeader({
  title = 'Meu Bingo',
  showTitle = true,
  onTitleChange,
  onToggleShow,
  editable = true,
  palette = 'lavender',
}: BingoHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleSave = () => {
    if (onTitleChange && localTitle.trim()) {
      onTitleChange(localTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalTitle(title);
      setIsEditing(false);
    }
  };

  const gradients = {
    lavender: 'from-purple-600 to-pink-600',
    rose: 'from-pink-600 to-rose-600',
    mint: 'from-green-600 to-teal-600',
    peach: 'from-orange-600 to-amber-600',
    sky: 'from-blue-600 to-cyan-600',
    coral: 'from-red-600 to-orange-600',
  };

  const gradient = gradients[palette as keyof typeof gradients] || gradients.lavender;

  if (!showTitle && !editable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 w-full"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  autoFocus
                  className="h-auto py-2 text-3xl font-bold md:text-4xl"
                  placeholder="Nome do Bingo"
                />
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group relative"
              >
                <h1
                  className={cn(
                    'text-3xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                    gradient
                  )}
                >
                  {title}
                </h1>

                {/* Decoração */}
                <div className="mt-2 flex items-center gap-2">
                  <div className={cn('h-1 flex-1 rounded-full bg-gradient-to-r', gradient)} />
                  <span className="text-2xl">🎉</span>
                  <div className={cn('h-1 flex-1 rounded-full bg-gradient-to-r', gradient)} />
                </div>

                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="absolute -right-12 top-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {editable && onToggleShow && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleShow}
            className="shrink-0"
          >
            {showTitle ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
