import type { BingoConfig } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(config: BingoConfig): ValidationResult {
  const errors: string[] = [];

  // Validar intervalo de números
  if (config.minNumber >= config.maxNumber) {
    errors.push('O número mínimo deve ser menor que o máximo');
  }

  // Calcular células necessárias
  const totalCells = config.gridSize * config.gridSize;
  const freeCells = config.freeCenter ? 1 : 0;
  const requiredNumbers = totalCells - freeCells;

  const availableNumbers = config.maxNumber - config.minNumber + 1;

  if (availableNumbers < requiredNumbers) {
    errors.push(
      `Intervalo insuficiente: ${availableNumbers} números disponíveis para ${requiredNumbers} células`
    );
  }

  // Validar por modo de agrupamento
  if (config.groupingMode === 'equalBuckets' || config.groupingMode === 'dozens') {
    const numbersPerColumn = Math.floor(availableNumbers / config.gridSize);
    const cellsPerColumn = config.gridSize;

    if (numbersPerColumn < cellsPerColumn) {
      errors.push(
        `Cada coluna precisa de ${cellsPerColumn} números, mas há apenas ${numbersPerColumn} disponíveis por coluna`
      );
    }
  }

  // Validar labels
  if (config.columnsLabels && config.columnsLabels.length !== config.gridSize) {
    errors.push(
      `Número de labels (${config.columnsLabels.length}) não corresponde ao grid (${config.gridSize})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCardUniqueness(
  cards: Array<{ cells: Array<{ value?: number }> }>
): boolean {
  const hashes = new Set<string>();

  for (const card of cards) {
    const hash = cardToHash(card);
    if (hashes.has(hash)) {
      return false;
    }
    hashes.add(hash);
  }

  return true;
}

export function cardToHash(card: { cells: Array<{ value?: number }> }): string {
  return card.cells
    .map((cell) => cell.value ?? 'X')
    .join('|');
}
