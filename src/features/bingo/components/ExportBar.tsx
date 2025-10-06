'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileImage, FileText, Share2, QrCode } from 'lucide-react';
import { useBingoStore } from '../state/useBingoStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export function ExportBar() {
  const { config, deckCards, generateMultipleCards, currentCard } = useBingoStore();
  const [cardCount, setCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState<'1' | '2' | '4'>('1');
  const [dpi, setDpi] = useState<'150' | '300'>('300');

  const handleGenerateDeck = async () => {
    setIsGenerating(true);
    generateMultipleCards(cardCount);
    setTimeout(() => setIsGenerating(false), 500);
  };

  const renderCardToImage = async (card: any, width = 1200): Promise<string> => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.background = 'white';
    container.style.padding = '40px';

    // Renderizar cartela (simplificado - você pode importar CardGrid aqui)
    container.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        ${config.showTitle ? `<h1 style="text-align: center; font-size: 32px; margin-bottom: 20px; background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${config.title || 'Bingo'}</h1>` : ''}
        <div style="display: grid; grid-template-columns: repeat(${config.gridSize}, 1fr); gap: 8px; max-width: 600px; margin: 0 auto;">
          ${card.cells.map((cell: any) => `
            <div style="aspect-ratio: 1; background: #f3e8ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #581c87;">
              ${cell.value || '★'}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const dataUrl = await toPng(container, {
        quality: 1,
        pixelRatio: dpi === '300' ? 3 : 1.5,
      });
      return dataUrl;
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleExportPNG = async () => {
    if (deckCards.length === 0 && !currentCard) return;

    setIsExporting(true);
    try {
      const cardsToExport = deckCards.length > 0 ? deckCards : [currentCard];

      if (cardsToExport.length === 1) {
        // Exportar cartela única
        const dataUrl = await renderCardToImage(cardsToExport[0]);
        const link = document.createElement('a');
        link.download = `cartela-bingo-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        // Exportar múltiplas cartelas como ZIP
        const zip = new JSZip();

        for (let i = 0; i < cardsToExport.length; i++) {
          const dataUrl = await renderCardToImage(cardsToExport[i]);
          const base64Data = dataUrl.split(',')[1];
          if (base64Data) {
            zip.file(`cartela-${i + 1}.png`, base64Data, { base64: true });
          }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = `cartelas-bingo-${Date.now()}.zip`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (deckCards.length === 0 && !currentCard) return;

    setIsExporting(true);
    try {
      const cardsToExport = deckCards.length > 0 ? deckCards : [currentCard];
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      const perPage = parseInt(cardsPerPage);

      for (let i = 0; i < cardsToExport.length; i++) {
        const dataUrl = await renderCardToImage(cardsToExport[i], 1200);

        if (i > 0 && i % perPage === 0) {
          pdf.addPage();
        }

        const pageIndex = i % perPage;
        let x = margin;
        let y = margin;
        let cardWidth = pageWidth - 2 * margin;
        let cardHeight = cardWidth; // Square cards

        if (perPage === 2) {
          y = pageIndex === 0 ? margin : pageHeight / 2 + margin / 2;
          cardHeight = (pageHeight - 3 * margin) / 2;
          cardWidth = cardHeight;
          x = (pageWidth - cardWidth) / 2;
        } else if (perPage === 4) {
          const col = pageIndex % 2;
          const row = Math.floor(pageIndex / 2);
          cardWidth = (pageWidth - 3 * margin) / 2;
          cardHeight = cardWidth;
          x = margin + col * (cardWidth + margin);
          y = margin + row * (cardHeight + margin);
        }

        pdf.addImage(dataUrl, 'PNG', x, y, cardWidth, cardHeight);

        // Marcas de corte
        if (perPage > 1) {
          pdf.setLineWidth(0.1);
          pdf.setDrawColor(200, 200, 200);
          pdf.line(x - 3, y, x, y); // top left
          pdf.line(x, y - 3, x, y);
          pdf.line(x + cardWidth, y - 3, x + cardWidth, y); // top right
          pdf.line(x + cardWidth, y, x + cardWidth + 3, y);
        }
      }

      pdf.save(`cartelas-bingo-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent('Confira as cartelas de bingo do nosso evento!');
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Geração em Lote */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Gerar Múltiplas Cartelas</h3>

        <div className="space-y-4">
          <div>
            <Label>Quantidade de Cartelas: {cardCount}</Label>
            <Slider
              value={[cardCount]}
              onValueChange={(val) => setCardCount(val[0] || 1)}
              min={1}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleGenerateDeck}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Gerando...' : `Gerar ${cardCount} Cartelas`}
          </Button>

          {deckCards.length > 0 && (
            <p className="text-sm text-green-600 font-medium">
              ✓ {deckCards.length} cartelas geradas com sucesso
            </p>
          )}
        </div>
      </div>

      {/* Opções de Exportação */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Exportar & Compartilhar</h3>

        {/* Configurações de Exportação */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm">Cartelas por página (PDF)</Label>
            <Select value={cardsPerPage} onValueChange={(val) => setCardsPerPage(val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 por página</SelectItem>
                <SelectItem value="2">2 por página</SelectItem>
                <SelectItem value="4">4 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Resolução</Label>
            <Select value={dpi} onValueChange={(val) => setDpi(val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="150">150 DPI (Rápido)</SelectItem>
                <SelectItem value="300">300 DPI (Alta qualidade)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExportPNG}
            disabled={deckCards.length === 0 && !currentCard}
            className="gap-2"
          >
            {isExporting ? (
              <>Exportando...</>
            ) : (
              <>
                <FileImage className="w-4 h-4" />
                PNG
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={deckCards.length === 0 && !currentCard}
            className="gap-2"
          >
            {isExporting ? (
              <>Exportando...</>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                PDF
              </>
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={deckCards.length === 0}
                className="gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar QR Codes</DialogTitle>
                <DialogDescription>
                  QR codes para cada cartela (em desenvolvimento)
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center text-gray-500">
                <QrCode className="w-16 h-16 mx-auto mb-4" />
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleShareWhatsApp}
            disabled={deckCards.length === 0}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Preview das Cartelas */}
      {deckCards.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Preview das Cartelas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {deckCards.slice(0, 12).map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-2 border-gray-200 rounded-lg p-2 hover:border-purple-400 transition-colors"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    Cartela #{index + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          {deckCards.length > 12 && (
            <p className="text-sm text-gray-500 mt-4">
              + {deckCards.length - 12} cartelas adicionais
            </p>
          )}
        </div>
      )}
    </div>
  );
}
