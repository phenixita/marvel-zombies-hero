import { GameState } from "./GameState";

/**
 * Represents a game event that can be undone/redone
 */
export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  description: string;
  stateBefore: GameState;
  stateAfter: GameState;
}

/**
 * Types of events that can occur in the game
 */
export type GameEventType =
  | 'GAME_INIT'
  | 'HERO_UPDATE'
  | 'HERO_HEALTH_CHANGE'
  | 'HERO_HUNGER_CHANGE'
  | 'HERO_LEVEL_CHANGE'
  | 'HERO_NAME_CHANGE'
  | 'TRAIT_SAVE'
  | 'TRAIT_DELETE'
  | 'BYSTANDER_SAVE'
  | 'TURN_START'
  | 'TURN_END'
  | 'PHASE_CHANGE'
  | 'ATTACK'
  | 'DEVOUR'
  | 'GAIN_TRAIT'
  | 'ACTION_CONSUME'
  | 'AUTOMATIC_MODE_TOGGLE';

/**
 * Event history state with undo/redo stacks
 */
export interface EventHistory {
  past: GameEvent[];
  future: GameEvent[];
  currentState: GameState;
}
