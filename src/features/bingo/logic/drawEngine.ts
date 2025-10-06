import seedrandom from 'seedrandom';
import type { DrawState } from '../types';

/**
 * Motor de sorteio com RNG sementeado
 */
export class DrawEngine {
  private state: DrawState;
  private rng: seedrandom.PRNG;

  constructor(min: number, max: number, seed?: string) {
    const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    this.state = {
      available,
      drawn: [],
      rngSeed: seed || Date.now().toString(),
    };

    this.rng = seedrandom(this.state.rngSeed);
  }

  /**
   * Sorteia o próximo número
   */
  draw(): number | null {
    if (this.state.available.length === 0) {
      return null;
    }

    // Escolher índice aleatório
    const index = Math.floor(this.rng() * this.state.available.length);
    const number = this.state.available.splice(index, 1)[0];

    this.state.drawn.push(number);
    this.state.last = number;

    return number;
  }

  /**
   * Reseta o sorteio
   */
  reset(newSeed?: string): void {
    const min = Math.min(...this.state.drawn, ...this.state.available);
    const max = Math.max(...this.state.drawn, ...this.state.available);

    const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    this.state = {
      available,
      drawn: [],
      last: undefined,
      rngSeed: newSeed || this.state.rngSeed,
    };

    this.rng = seedrandom(this.state.rngSeed);
  }

  /**
   * Retorna o estado atual
   */
  getState(): DrawState {
    return { ...this.state };
  }

  /**
   * Último número sorteado
   */
  getLast(): number | undefined {
    return this.state.last;
  }

  /**
   * Histórico completo
   */
  getHistory(): number[] {
    return [...this.state.drawn];
  }

  /**
   * Números ainda disponíveis
   */
  getAvailable(): number[] {
    return [...this.state.available];
  }

  /**
   * Verifica se ainda há números
   */
  hasMore(): boolean {
    return this.state.available.length > 0;
  }

  /**
   * Total de números sorteados
   */
  getDrawnCount(): number {
    return this.state.drawn.length;
  }
}
