import seedrandom from 'seedrandom';
import type { BingoConfig, CardCell, CardMatrix } from '../types';

/**
 * Gera uma única cartela de bingo baseada na configuração
 */
export function generateCard(config: BingoConfig, cardSeed?: string): CardMatrix {
  const rng = seedrandom(cardSeed || config.seed || Math.random().toString());
  const { gridSize, minNumber, maxNumber, freeCenter, groupingMode } = config;

  const cells: CardCell[] = [];
  const centerIndex = Math.floor(gridSize / 2);

  // Criar buckets por coluna
  const buckets = createBuckets(minNumber, maxNumber, gridSize, groupingMode);

  // Para cada coluna
  for (let col = 0; col < gridSize; col++) {
    const bucket = buckets[col];
    const isCenter = freeCenter && gridSize % 2 === 1 && col === centerIndex;
    const numbersNeeded = isCenter ? gridSize - 1 : gridSize;

    // Sample aleatório do bucket
    const selectedNumbers = shuffle([...bucket], rng).slice(0, numbersNeeded);

    // Criar células para esta coluna
    for (let row = 0; row < gridSize; row++) {
      const isCenterCell = isCenter && row === centerIndex;

      cells.push({
        row,
        col,
        value: isCenterCell ? undefined : selectedNumbers.shift(),
        marked: isCenterCell ? false : false,
      });
    }
  }

  return { cells };
}

/**
 * Cria buckets (faixas de números) por coluna
 */
function createBuckets(
  min: number,
  max: number,
  gridSize: number,
  mode: BingoConfig['groupingMode']
): number[][] {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  if (mode === 'none') {
    // Todos compartilham o mesmo universo
    return Array(gridSize).fill(range);
  }

  if (mode === 'equalBuckets') {
    // Dividir em faixas iguais
    const bucketSize = Math.ceil(range.length / gridSize);
    const buckets: number[][] = [];

    for (let i = 0; i < gridSize; i++) {
      const start = i * bucketSize;
      const end = Math.min(start + bucketSize, range.length);
      buckets.push(range.slice(start, end));
    }

    return buckets;
  }

  if (mode === 'dozens') {
    // Agrupar por dezenas
    const dozenBuckets: number[][] = [];
    let currentDozen = Math.floor(min / 10) * 10;

    while (currentDozen <= max) {
      const bucket = range.filter(
        (n) => n >= currentDozen && n < currentDozen + 10
      );
      if (bucket.length > 0) {
        dozenBuckets.push(bucket);
      }
      currentDozen += 10;
    }

    // Distribuir dezenas entre colunas
    const bucketsPerCol = Math.ceil(dozenBuckets.length / gridSize);
    const columnBuckets: number[][] = [];

    for (let i = 0; i < gridSize; i++) {
      const start = i * bucketsPerCol;
      const end = Math.min(start + bucketsPerCol, dozenBuckets.length);
      const merged = dozenBuckets.slice(start, end).flat();
      columnBuckets.push(merged);
    }

    return columnBuckets;
  }

  return [];
}

/**
 * Shuffle array com RNG sementeado (Fisher-Yates)
 */
function shuffle<T>(array: T[], rng: seedrandom.PRNG): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
