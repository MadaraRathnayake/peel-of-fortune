// Event-Driven Architecture: EventBus for decoupled game logic
// This runs server-side; client mirrors events via API responses

export type GameEventType =
  | 'GAME_STARTED'
  | 'PUZZLE_LOADED'
  | 'ANSWER_SUBMITTED'
  | 'CORRECT_ANSWER'
  | 'WRONG_ANSWER'
  | 'COMBO_ACHIEVED'
  | 'TIME_UPDATED'
  | 'GAME_OVER';

export interface GameEvent<T = unknown> {
  type: GameEventType;
  payload: T;
  timestamp: number;
}

type EventHandler<T = unknown> = (event: GameEvent<T>) => void;

class EventBus {
  private handlers: Map<GameEventType, EventHandler[]> = new Map();

  on<T>(type: GameEventType, handler: EventHandler<T>): void {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(type, [...existing, handler as EventHandler]);
  }

  off(type: GameEventType, handler: EventHandler): void {
    const existing = this.handlers.get(type) ?? [];
    this.handlers.set(
      type,
      existing.filter((h) => h !== handler)
    );
  }

  emit<T>(type: GameEventType, payload: T): void {
    const event: GameEvent<T> = { type, payload, timestamp: Date.now() };
    const handlers = this.handlers.get(type) ?? [];
    handlers.forEach((h) => h(event as GameEvent));
  }
}

// Singleton event bus for the server process
export const eventBus = new EventBus();
