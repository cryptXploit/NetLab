import { type SimulationEvent, type SimulationEventType } from '../events/SimulationEvent';
import { type SimulationEngine } from './SimulationEngine';

export type EventHandler = (event: SimulationEvent, engine: SimulationEngine) => void;

export class EventDispatcher {
  private handlers: Map<SimulationEventType, EventHandler> = new Map();

  public registerHandler(type: SimulationEventType, handler: EventHandler): void {
    if (this.handlers.has(type)) {
      throw new Error(`Handler for event type ${type} is already registered`);
    }
    this.handlers.set(type, handler);
  }

  public dispatch(event: SimulationEvent, engine: SimulationEngine): void {
    const handler = this.handlers.get(event.type);
    if (!handler) {
      throw new Error(`No handler registered for event type: ${event.type}`);
    }
    handler(event, engine);
  }
}
