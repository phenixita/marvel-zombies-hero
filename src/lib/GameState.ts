import { Hero } from "./Hero";
import { Round } from "./Round";
import { Turn } from "./Turn";

export const MAX_GAME_HISTORY_LENGTH = 10;

export interface GameHistoryEntry {
  sessionId: string;
  archivedAt: number;
  state: GameStateSnapshot;
}

export type GameStateSnapshot = Omit<GameState, "gameHistory">;

export interface GameState {
  gameSessionId?: string;
  heroes: Hero[];
  currentRound?: Round;
  currentTurn?: Turn;
  isAutomaticMode?: boolean;
  gameOver?: boolean;
  gameHistory?: GameHistoryEntry[];
}

export function createGameSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureGameSessionId(state: GameState, fallbackSessionId?: string): GameState {
  return normalizeGameState(state, fallbackSessionId);
}

export function isGameStateEmpty(state: GameState): boolean {
  return state.heroes.length === 0;
}

export function normalizeGameState(state: GameState, fallbackSessionId?: string): GameState {
  const gameSessionId =
    typeof state.gameSessionId === "string" && state.gameSessionId.length > 0
      ? state.gameSessionId
      : fallbackSessionId ?? createGameSessionId();

  const heroes = Array.isArray(state.heroes) ? state.heroes : [];
  const normalizedHistory = normalizeGameHistory((state as GameState & { gameHistory?: unknown }).gameHistory);

  return {
    ...state,
    gameSessionId,
    heroes,
    gameHistory: normalizedHistory,
  };
}

export function archiveCurrentGameIfNeeded(state: GameState, archivedAt = Date.now()): GameState {
  const normalized = normalizeGameState(state);
  if (isGameStateEmpty(normalized)) {
    return normalized;
  }

  const snapshot = toGameStateSnapshot(normalized);
  const sessionId = snapshot.gameSessionId ?? normalized.gameSessionId ?? createGameSessionId();
  const currentEntry: GameHistoryEntry = {
    sessionId,
    archivedAt,
    state: {
      ...snapshot,
      gameSessionId: sessionId,
    },
  };

  const dedupedHistory = (normalized.gameHistory ?? []).filter((entry) => entry.sessionId !== sessionId);

  return {
    ...normalized,
    gameHistory: [currentEntry, ...dedupedHistory].slice(0, MAX_GAME_HISTORY_LENGTH),
  };
}

export function toGameStateSnapshot(state: GameState): GameStateSnapshot {
  const gameSessionId =
    typeof state.gameSessionId === "string" && state.gameSessionId.length > 0
      ? state.gameSessionId
      : createGameSessionId();
  const heroes = Array.isArray(state.heroes) ? state.heroes : [];
  const { gameHistory: _gameHistory, ...snapshot } = state;

  return {
    ...snapshot,
    gameSessionId,
    heroes,
  };
}

function normalizeGameHistory(gameHistory: unknown): GameHistoryEntry[] {
  if (!Array.isArray(gameHistory)) {
    return [];
  }

  const entries: GameHistoryEntry[] = [];
  const seenSessionIds = new Set<string>();

  for (const item of gameHistory) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const raw = item as Partial<GameHistoryEntry>;
    const rawState = raw.state;
    if (!rawState || typeof rawState !== "object") {
      continue;
    }

    const inferredSessionId =
      typeof (rawState as GameState).gameSessionId === "string" && (rawState as GameState).gameSessionId
        ? (rawState as GameState).gameSessionId
        : undefined;
    const sessionId =
      typeof raw.sessionId === "string" && raw.sessionId.length > 0
        ? raw.sessionId
        : inferredSessionId ?? createGameSessionId();

    if (seenSessionIds.has(sessionId)) {
      continue;
    }

    seenSessionIds.add(sessionId);

    const archivedAt =
      typeof raw.archivedAt === "number" && Number.isFinite(raw.archivedAt)
        ? raw.archivedAt
        : 0;

    const normalizedSnapshot = toGameStateSnapshot({
      ...(rawState as GameState),
      gameSessionId: sessionId,
    });

    entries.push({
      sessionId,
      archivedAt,
      state: {
        ...normalizedSnapshot,
        gameSessionId: sessionId,
      },
    });
  }

  return entries.slice(0, MAX_GAME_HISTORY_LENGTH);
}
