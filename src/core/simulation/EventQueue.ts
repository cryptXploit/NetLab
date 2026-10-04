import { type SimulationEvent } from '../events/SimulationEvent';

export class EventQueue {
  private queue: SimulationEvent[] = [];

  /**
   * Enqueues an event, maintaining the sorted order by timestamp.
   * Events with the same timestamp are processed in the order they were enqueued (FIFO).
   */
  public enqueue(event: SimulationEvent): void {
    // A simple insertion sort-like approach to maintain priority queue
    // Find the right position to insert
    let i = this.queue.length - 1;
    while (i >= 0 && this.queue[i].timestamp > event.timestamp) {
      i--;
    }
    this.queue.splice(i + 1, 0, event);
  }

  /**
   * Retrieves all events that are scheduled for a given tick or earlier.
   */
  public dequeueEventsUpTo(tick: number): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    while (this.queue.length > 0 && this.queue[0].timestamp <= tick) {
      events.push(this.queue.shift()!);
    }
    return events;
  }

  /**
   * Returns all queued events.
   */
  public getEvents(): SimulationEvent[] {
    return [...this.queue];
  }

  /**
   * Clears the queue.
   */
  public clear(): void {
    this.queue = [];
  }
}
