import seedrandom from 'seedrandom';
import type { BingoConfig, CardMatrix } from '../types';
import { generateCard } from './generateCard';
import { cardToHash, validateCardUniqueness } from './validators';

export interface GenerateDeckOptions {
  count: number;
  maxAttempts?: number; // Tentativas máximas para evitar duplicatas
}

export interface GenerateDeckResult {
  cards: CardMatrix[];
  duplicatesFound: number;
  success: boolean;
}

/**
 * Gera múltiplas cartelas únicas
 */
export function generateDeck(
  config: BingoConfig,
  options: GenerateDeckOptions
): GenerateDeckResult {
  const { count, maxAttempts = 1000 } = options;
  const masterRng = seedrandom(config.seed || Date.now().toString());

  const cards: CardMatrix[] = [];
  const hashes = new Set<string>();
  let duplicatesFound = 0;
  let attempts = 0;

  while (cards.length < count && attempts < maxAttempts) {
    attempts++;

    // Gerar seed única para esta cartela
    const cardSeed = `${config.seed || 'base'}-${masterRng()}`;
    const card = generateCard(config, cardSeed);
    const hash = cardToHash(card);

    if (!hashes.has(hash)) {
      hashes.add(hash);
      cards.push(card);
    } else {
      duplicatesFound++;
    }
  }

  return {
    cards,
    duplicatesFound,
    success: cards.length === count,
  };
}

/**
 * Calcula o número máximo teórico de cartelas únicas
 */
export function calculateMaxUniqueCards(config: BingoConfig): number {
  const { gridSize, minNumber, maxNumber, freeCenter } = config;

  const totalCells = gridSize * gridSize;
  const freeCells = freeCenter ? 1 : 0;
  const requiredNumbers = totalCells - freeCells;
  const availableNumbers = maxNumber - minNumber + 1;

  // Aproximação: C(n, k) onde n = números disponíveis, k = números necessários
  // Para grids grandes, o número é astronômico, então limitamos
  if (availableNumbers < requiredNumbers) return 0;

  // Estimativa conservadora
  return Math.min(
    combinations(availableNumbers, requiredNumbers),
    1000000 // Limite prático
  );
}

function combinations(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i) / (i + 1);
  }

  return Math.floor(result);
}
