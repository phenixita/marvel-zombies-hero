import { useCallback, useEffect, useState } from "react";
import { GameState } from "@/lib/GameState";
import { EventHistory, GameEvent, GameEventType } from "@/lib/GameEvent";

const STORAGE_KEY = 'marvel-zombies-event-history';
const MAX_HISTORY_SIZE = 100; // Limit history to prevent memory issues

/**
 * Load event history from localStorage
 */
const loadEventHistory = (initialState: GameState): EventHistory => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        past: [],
        future: [],
        currentState: initialState,
      };
    }

    const parsed = JSON.parse(raw) as EventHistory;
    // Use currentState from storage if it exists, otherwise use initial
    return {
      past: parsed.past || [],
      future: parsed.future || [],
      currentState: parsed.currentState || initialState,
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return {
      past: [],
      future: [],
      currentState: initialState,
    };
  }
};

/**
 * Save event history to localStorage
 */
const saveEventHistory = (history: EventHistory) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save event history:', error);
  }
};

interface UseEventHistoryReturn {
  state: GameState;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  recordEvent: (type: GameEventType, description: string, newState: GameState) => void;
  clearHistory: () => void;
}

/**
 * Hook for managing game state with event history and undo/redo functionality
 */
export function useEventHistory(initialState: GameState): UseEventHistoryReturn {
  const [history, setHistory] = useState<EventHistory>(() => 
    loadEventHistory(initialState)
  );

  // Save to localStorage whenever history changes
  useEffect(() => {
    saveEventHistory(history);
  }, [history]);

  // Record a new event
  const recordEvent = useCallback((
    type: GameEventType,
    description: string,
    newState: GameState
  ) => {
    setHistory((current) => {
      const event: GameEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type,
        description,
        stateBefore: current.currentState,
        stateAfter: newState,
      };

      // Limit past history size
      const past = [...current.past, event];
      if (past.length > MAX_HISTORY_SIZE) {
        past.shift(); // Remove oldest event
      }

      return {
        past,
        future: [], // Clear redo stack when new action is performed
        currentState: newState,
      };
    });
  }, []);

  // Undo the last event
  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) {
        return current;
      }

      const lastEvent = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);

      return {
        past: newPast,
        future: [lastEvent, ...current.future],
        currentState: lastEvent.stateBefore,
      };
    });
  }, []);

  // Redo the next event
  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) {
        return current;
      }

      const nextEvent = current.future[0];
      const newFuture = current.future.slice(1);

      return {
        past: [...current.past, nextEvent],
        future: newFuture,
        currentState: nextEvent.stateAfter,
      };
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory((current) => ({
      past: [],
      future: [],
      currentState: current.currentState,
    }));
  }, []);

  return {
    state: history.currentState,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    recordEvent,
    clearHistory,
  };
}
