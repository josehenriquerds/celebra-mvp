'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload, Type } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface DraggableAssetProps {
  id: string;
  type: 'image' | 'text';
  url?: string;
  content?: string;
  preview?: string;
}

function DraggableAsset({ id, type, url, content, preview }: DraggableAssetProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type, url, content },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'cursor-grab active:cursor-grabbing rounded-lg border-2 border-gray-200 p-2 bg-white shadow-sm',
        isDragging && 'opacity-50'
      )}
    >
      {type === 'image' && url && (
        <img src={url} alt={id} className="size-16 rounded object-cover" />
      )}
      {type === 'text' && content && (
        <div className="flex size-16 items-center justify-center text-center text-sm font-medium">
          {content}
        </div>
      )}
    </motion.div>
  );
}

export function AssetTray() {
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');

  // Imagens de exemplo (substituir por upload real)
  const defaultImages = [
    'https://api.dicebear.com/7.x/shapes/svg?seed=1',
    'https://api.dicebear.com/7.x/shapes/svg?seed=2',
    'https://api.dicebear.com/7.x/shapes/svg?seed=3',
    'https://api.dicebear.com/7.x/shapes/svg?seed=4',
    'https://api.dicebear.com/7.x/shapes/svg?seed=5',
    'https://api.dicebear.com/7.x/shapes/svg?seed=6',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCustomImages((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    // Implementar lógica de adicionar texto
    setTextInput('');
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-lg">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <ImageIcon className="size-5" />
        Biblioteca de Recursos
      </h3>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="text">Textos</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          {/* Upload */}
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-purple-400">
                <Upload className="mx-auto mb-2 size-8 text-gray-400" />
                <p className="text-sm text-gray-600">Clique para fazer upload</p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Grid de imagens */}
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
            {[...defaultImages, ...customImages].map((url, index) => (
              <DraggableAsset
                key={`image-${index}`}
                id={`image-${index}`}
                type="image"
                url={url}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          {/* Input de texto */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite um texto..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            />
            <Button onClick={handleAddText} size="icon">
              <Type className="size-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Arraste textos personalizados para as células
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
