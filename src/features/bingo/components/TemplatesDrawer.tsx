'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { useBingoStore } from '../state/useBingoStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function TemplatesDrawer() {
  const { templates, applyTemplate, config } = useBingoStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Templates
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Templates de Bingo</SheetTitle>
          <SheetDescription>
            Escolha um template pronto ou crie o seu personalizado
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left h-auto py-4 px-4 relative',
                  'hover:bg-purple-50 transition-all'
                )}
                onClick={() => applyTemplate(template.id)}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-gray-400">
                    {template.config.gridSize && (
                      <span>{template.config.gridSize}x{template.config.gridSize}</span>
                    )}
                    {template.config.theme?.palette && (
                      <span className="capitalize">{template.config.theme.palette}</span>
                    )}
                  </div>
                </div>
                {template.config.theme?.palette && (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full border-2',
                      template.config.theme.palette === 'lavender' && 'bg-purple-200 border-purple-300',
                      template.config.theme.palette === 'rose' && 'bg-pink-200 border-pink-300',
                      template.config.theme.palette === 'mint' && 'bg-green-200 border-green-300',
                      template.config.theme.palette === 'peach' && 'bg-orange-200 border-orange-300',
                      template.config.theme.palette === 'sky' && 'bg-blue-200 border-blue-300',
                      template.config.theme.palette === 'coral' && 'bg-red-200 border-red-300'
                    )}
                  />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
