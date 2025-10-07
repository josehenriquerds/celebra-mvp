'use client';

import { motion } from 'framer-motion';
import { Settings, Grid3x3, Hash, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBingoStore } from '../state/useBingoStore';

export function SidebarConfigurator() {
  const { config, setConfig, generateNewCard } = useBingoStore();

  const handleApply = () => {
    generateNewCard();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg md:w-80"
    >
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-purple-600" />
        <h2 className="text-xl font-bold">Configuração</h2>
      </div>

      <Separator />

      {/* Grid Size */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Grid3x3 className="size-4" />
          Tamanho do Grid
        </Label>
        <Select
          value={config.gridSize.toString()}
          onValueChange={(val) => setConfig({ gridSize: parseInt(val) as 3 | 4 | 5 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3x3</SelectItem>
            <SelectItem value="4">4x4</SelectItem>
            <SelectItem value="5">5x5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Range de Números */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Hash className="size-4" />
          Intervalo de Números
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-500">Mínimo</Label>
            <Input
              type="number"
              value={config.minNumber}
              onChange={(e) => setConfig({ minNumber: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Máximo</Label>
            <Input
              type="number"
              value={config.maxNumber}
              onChange={(e) => setConfig({ maxNumber: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Modo de Agrupamento */}
      <div className="space-y-2">
        <Label>Distribuição</Label>
        <Select
          value={config.groupingMode}
          onValueChange={(val) => setConfig({ groupingMode: val as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equalBuckets">Faixas Iguais</SelectItem>
            <SelectItem value="dozens">Dezenas</SelectItem>
            <SelectItem value="none">Aleatório</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Casa Central Livre */}
      <div className="flex items-center justify-between">
        <Label>Casa Central Livre</Label>
        <Switch
          checked={config.freeCenter}
          onCheckedChange={(checked) => setConfig({ freeCenter: checked })}
        />
      </div>

      {/* Paleta de Cores */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Palette className="size-4" />
          Tema
        </Label>
        <Select
          value={config.theme.palette}
          onValueChange={(val) => setConfig({ theme: { ...config.theme, palette: val as any } })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lavender">Lavanda</SelectItem>
            <SelectItem value="rose">Rosa</SelectItem>
            <SelectItem value="mint">Menta</SelectItem>
            <SelectItem value="peach">Pêssego</SelectItem>
            <SelectItem value="sky">Céu</SelectItem>
            <SelectItem value="coral">Coral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Título do Bingo */}
      <div className="space-y-2">
        <Label>Título do Bingo</Label>
        <Input
          value={config.title || ''}
          onChange={(e) => setConfig({ title: e.target.value })}
          placeholder="Ex: Dalila faz 20 e poucos"
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showTitle ?? true}
            onCheckedChange={(checked) => setConfig({ showTitle: checked })}
          />
          <Label className="text-sm">Mostrar título no preview</Label>
        </div>
      </div>

      <Separator />

      {/* Cores da Grade */}
      <div className="space-y-2">
        <Label>Padrão de Cores</Label>
        <Select
          value={config.cellTheme?.pattern || 'none'}
          onValueChange={(val) =>
            setConfig({
              cellTheme: {
                ...(config.cellTheme || { colorA: 'bg-purple-50', colorB: 'bg-pink-50' }),
                pattern: val as any,
              },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem padrão</SelectItem>
            <SelectItem value="chess">Xadrez</SelectItem>
            <SelectItem value="row-stripes">Linhas</SelectItem>
            <SelectItem value="col-stripes">Colunas</SelectItem>
          </SelectContent>
        </Select>

        {config.cellTheme?.pattern !== 'none' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Cor A</Label>
              <Input
                type="text"
                value={config.cellTheme?.colorA || 'bg-purple-50'}
                onChange={(e) =>
                  setConfig({
                    cellTheme: { ...config.cellTheme!, colorA: e.target.value },
                  })
                }
                placeholder="bg-purple-50"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Cor B</Label>
              <Input
                type="text"
                value={config.cellTheme?.colorB || 'bg-pink-50'}
                onChange={(e) =>
                  setConfig({
                    cellTheme: { ...config.cellTheme!, colorB: e.target.value },
                  })
                }
                placeholder="bg-pink-50"
                className="mt-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Recursos Avançados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Imagens por Célula</Label>
          <Switch
            checked={config.allowImagesPerCell}
            onCheckedChange={(checked) => setConfig({ allowImagesPerCell: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Imagem Central</Label>
          <Switch
            checked={config.allowCenterImage}
            onCheckedChange={(checked) => setConfig({ allowCenterImage: checked })}
          />
        </div>
      </div>

      <Button onClick={handleApply} className="w-full" size="lg">
        Aplicar & Gerar Cartela
      </Button>
    </motion.div>
  );
}
