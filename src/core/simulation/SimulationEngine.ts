import { type Device } from '../domain/Device';
import { type Link } from '../domain/Link';
import { type SimulationEvent } from '../events/SimulationEvent';
import { EventQueue } from './EventQueue';

export class SimulationEngine {
  private devices: Map<string, Device> = new Map();
  private links: Map<string, Link> = new Map();
  
  private eventQueue: EventQueue = new EventQueue();
  private eventHistory: SimulationEvent[] = [];
  
  private currentTick: number = 0;

  /**
   * Adds a device to the simulation topology.
   */
  public addDevice(device: Device): void {
    if (this.devices.has(device.id)) {
      throw new Error(`Device with ID ${device.id} already exists`);
    }
    this.devices.set(device.id, device);
  }

  /**
   * Adds a link to the simulation topology, verifying the endpoints exist.
   */
  public addLink(link: Link): void {
    if (this.links.has(link.id)) {
      throw new Error(`Link with ID ${link.id} already exists`);
    }

    // Verify endpoints exist
    let found1 = false;
    let found2 = false;

    for (const device of this.devices.values()) {
      for (const iface of device.interfaces) {
        if (iface.id === link.interface1Id) found1 = true;
        if (iface.id === link.interface2Id) found2 = true;
      }
    }

    if (!found1) {
      throw new Error(`Interface ${link.interface1Id} not found in topology`);
    }
    if (!found2) {
      throw new Error(`Interface ${link.interface2Id} not found in topology`);
    }

    this.links.set(link.id, link);
  }

  /**
   * Enqueues an event to be processed at a future tick.
   * @param event The event to enqueue. Its timestamp will be modified.
   * @param delayTicks The number of ticks from the current tick to schedule the event.
   */
  public enqueueEvent(event: SimulationEvent, delayTicks: number = 0): void {
    if (delayTicks < 0) {
      throw new Error('Cannot schedule an event in the past (negative delayTicks)');
    }
    
    event.timestamp = this.currentTick + delayTicks;
    this.eventQueue.enqueue(event);
  }

  /**
   * Advances the simulation by a given number of ticks, processing any scheduled events.
   * @param steps The number of ticks to advance (default 1).
   */
  public tick(steps: number = 1): void {
    if (steps < 1) {
      throw new Error('Must advance by at least 1 tick');
    }

    const targetTick = this.currentTick + steps;

    // Process events chronologically up to the target tick
    while (this.currentTick < targetTick) {
      this.currentTick++;
      
      const currentEvents = this.eventQueue.dequeueEventsUpTo(this.currentTick);
      
      for (const event of currentEvents) {
        this.processEvent(event);
      }
    }
  }

  /**
   * Processes a single event (currently a no-op handler) and adds it to history.
   * Detailed packet logic will be implemented in future phases.
   */
  private processEvent(event: SimulationEvent): void {
    // Phase 3: No deep routing logic yet, just record it in history
    this.eventHistory.push(event);
  }

  public getCurrentTick(): number {
    return this.currentTick;
  }

  public getEventHistory(): SimulationEvent[] {
    return [...this.eventHistory];
  }

  public getDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  public getLinks(): Link[] {
    return Array.from(this.links.values());
  }
}
