import type { CellPattern } from '../types';

/**
 * Retorna a classe de cor para uma célula baseada no padrão
 */
export function getCellColorClass(
  row: number,
  col: number,
  colorA: string,
  colorB: string,
  pattern: CellPattern = 'none'
): string {
  if (pattern === 'none') return colorA;

  if (pattern === 'chess') {
    return (row + col) % 2 === 0 ? colorA : colorB;
  }

  if (pattern === 'row-stripes') {
    return row % 2 === 0 ? colorA : colorB;
  }

  if (pattern === 'col-stripes') {
    return col % 2 === 0 ? colorA : colorB;
  }

  return colorA;
}

/**
 * Paleta de cores pastel pré-definidas
 */
export const pastellColors = {
  lavender: {
    light: 'bg-purple-50',
    default: 'bg-purple-100',
    dark: 'bg-purple-200',
  },
  rose: {
    light: 'bg-pink-50',
    default: 'bg-pink-100',
    dark: 'bg-pink-200',
  },
  mint: {
    light: 'bg-green-50',
    default: 'bg-green-100',
    dark: 'bg-green-200',
  },
  peach: {
    light: 'bg-orange-50',
    default: 'bg-orange-100',
    dark: 'bg-orange-200',
  },
  sky: {
    light: 'bg-blue-50',
    default: 'bg-blue-100',
    dark: 'bg-blue-200',
  },
  coral: {
    light: 'bg-red-50',
    default: 'bg-red-100',
    dark: 'bg-red-200',
  },
};
