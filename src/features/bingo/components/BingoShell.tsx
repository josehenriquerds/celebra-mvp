'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, Play, Users, Download, Layers } from 'lucide-react';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetTray } from './AssetTray';
import { BingoHeader } from './BingoHeader';
import { CardGrid } from './CardGrid';
import { ExportBar } from './ExportBar';
import { HostPanel } from './HostPanel';
import { LayerToolbar } from './LayerToolbar';
import { SidebarConfigurator } from './SidebarConfigurator';
import { Stage } from './Stage';
import { TemplatesDrawer } from './TemplatesDrawer';
import { DndProvider } from '../dnd/DndProvider';
import { useBingoStore } from '../state/useBingoStore';

export function BingoShell() {
  const {
    config,
    setConfig,
    currentCard,
    generateNewCard,
    viewMode,
    setViewMode,
  } = useBingoStore();

  useEffect(() => {
    // Gerar cartela inicial
    if (!currentCard) {
      generateNewCard();
    }
  }, [currentCard, generateNewCard]);

  return (
    <DndProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Gerar Cartelas de Bingo
            </h1>
            <p className="text-gray-600">
              Crie cartelas personalizadas para seu evento
            </p>
          </div>

          {/* Templates */}
          <div className="mb-6">
            <TemplatesDrawer />
          </div>

          {/* Tabs para diferentes modos */}
          <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as any)} className="w-full">
            <TabsList className="mb-6 grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="editor" className="gap-2">
                <LayoutGrid className="size-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="stage" className="gap-2">
                <Layers className="size-4" />
                Stage
              </TabsTrigger>
              <TabsTrigger value="host" className="gap-2">
                <Play className="size-4" />
                Sortear
              </TabsTrigger>
              <TabsTrigger value="player" className="gap-2">
                <Users className="size-4" />
                Jogar
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Download className="size-4" />
                Exportar
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
              {/* Sidebar */}
              <div className="space-y-4">
                <SidebarConfigurator />

                {/* AssetTray apenas no modo Editor */}
                {viewMode === 'editor' && config.allowImagesPerCell && (
                  <AssetTray />
                )}
              </div>

              {/* Conteúdo Principal */}
              <div className="flex-1">
                <TabsContent value="editor" className="mt-0">
                  <div className="space-y-4">
                    {config.showTitle && (
                      <BingoHeader
                        title={config.title}
                        showTitle={config.showTitle}
                        onTitleChange={(title) => setConfig({ title })}
                        onToggleShow={() => setConfig({ showTitle: !config.showTitle })}
                        editable={true}
                        palette={config.theme.palette}
                      />
                    )}
                    {currentCard && (
                      <CardGrid
                        card={currentCard}
                        gridSize={config.gridSize}
                        labels={config.columnsLabels}
                        cellTheme={config.cellTheme}
                        isEditable={true}
                        palette={config.theme.palette}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stage" className="mt-0">
                  <div className="flex gap-4">
                    <div className="flex flex-1 flex-col items-center">
                      <Stage width={800} height={800} showGrid={true} />
                    </div>
                    <LayerToolbar />
                  </div>
                </TabsContent>

                <TabsContent value="host" className="mt-0">
                  <HostPanel />
                </TabsContent>

                <TabsContent value="player" className="mt-0">
                  <div className="space-y-4">
                    {config.showTitle && (
                      <BingoHeader
                        title={config.title}
                        showTitle={config.showTitle}
                        editable={false}
                        palette={config.theme.palette}
                      />
                    )}
                    {currentCard && (
                      <CardGrid
                        card={currentCard}
                        gridSize={config.gridSize}
                        labels={config.columnsLabels}
                        cellTheme={config.cellTheme}
                        isEditable={false}
                        palette={config.theme.palette}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="space-y-4">
                    {config.showTitle && (
                      <BingoHeader
                        title={config.title}
                        showTitle={config.showTitle}
                        editable={false}
                        palette={config.theme.palette}
                      />
                    )}
                    <ExportBar />
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </DndProvider>
  );
}
