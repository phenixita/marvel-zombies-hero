import { Hero } from "./Hero";
import { Round } from "./Round";
import { Turn } from "./Turn";


export interface GameState {
  gameSessionId?: string;
  heroes: Hero[];
  currentRound?: Round;
  currentTurn?: Turn;
  isAutomaticMode?: boolean;
  gameOver?: boolean;
}

export function createGameSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `game-${Date.now()}`;
}

export function ensureGameSessionId(state: GameState, fallbackSessionId?: string): GameState {
  if (state.gameSessionId) {
    return state;
  }

  return {
    ...state,
    gameSessionId: fallbackSessionId ?? createGameSessionId(),
  };
}
