import { type Device } from '../domain/Device';
import { type Link } from '../domain/Link';
import { type SimulationEvent } from '../events/SimulationEvent';
import { EventQueue } from './EventQueue';
import { EventDispatcher } from './EventDispatcher';

import { type Packet } from '../domain/Packet';

export interface ActivePacket {
  packet: Packet;
  sourceId: string;
  targetId: string;
  progress: number;
}

export interface SimulationState {
  devices: Device[];
  links: Link[];
  eventQueue: SimulationEvent[];
  eventHistory: SimulationEvent[];
  activePackets: ActivePacket[];
  currentTick: number;
}

export class SimulationEngine {
  private devices: Map<string, Device> = new Map();
  private links: Map<string, Link> = new Map();
  
  private eventQueue: EventQueue = new EventQueue();
  private eventHistory: SimulationEvent[] = [];
  
  private activePackets: ActivePacket[] = [];
  
  private currentTick: number = 0;
  private dispatcher: EventDispatcher = new EventDispatcher();

  public getDispatcher(): EventDispatcher {
    return this.dispatcher;
  }

  /**
   * Adds a device to the simulation topology.
   */
  public addDevice(device: Device): void {
    if (this.devices.has(device.id)) {
      throw new Error(`Device with ID ${device.id} already exists`);
    }
    this.devices.set(device.id, device);
  }

  public clear(): void { this.devices.clear(); this.links.clear(); this.eventQueue.clear(); this.eventHistory = []; this.activePackets = []; this.currentTick = 0; }

  public removeDevice(id: string): void {
    const device = this.devices.get(id);
    if (!device) return;
    const ifaceIds = device.interfaces.map(i => i.id);
    for (const [linkId, link] of this.links.entries()) {
      if (ifaceIds.includes(link.interface1Id) || ifaceIds.includes(link.interface2Id)) {
        this.links.delete(linkId);
      }
    }
    this.devices.delete(id);
  }


  /**
   * Adds a link to the simulation topology, verifying the endpoints exist.
   */
  public addLink(link: Link): void {
    if (this.links.has(link.id)) {
      throw new Error(`Link with ID ${link.id} already exists`);
    }

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

  public removeLink(linkId: string): void {
    this.links.delete(linkId);
  }

  /**
   * Enqueues an event to be processed at a future tick.
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
   */
  public tick(steps: number = 1): void {
    if (steps < 1) {
      throw new Error('Must advance by at least 1 tick');
    }

    const targetTick = this.currentTick + steps;

    while (this.currentTick < targetTick) {
      this.currentTick++;
      
      const currentEvents = this.eventQueue.dequeueEventsUpTo(this.currentTick);
      
      for (const event of currentEvents) {
        this.processEvent(event);
      }
    }
  }

  private processEvent(event: SimulationEvent): void {
    // Record in history before processing so state reflects it
    this.eventHistory.push(event);
    
    // Dispatch to registered handlers
    this.dispatcher.dispatch(event, this);
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

  public getDevice(id: string): Device | undefined {
    return this.devices.get(id);
  }

  public getLinks(): Link[] {
    return Array.from(this.links.values());
  }

  public getLink(id: string): Link | undefined {
    return this.links.get(id);
  }

  public getLinkForInterface(interfaceId: string): Link | undefined {
    for (const link of this.links.values()) {
      if (link.interface1Id === interfaceId || link.interface2Id === interfaceId) {
        return link;
      }
    }
    return undefined;
  }

  public getActivePackets(): ActivePacket[] {
    return [...this.activePackets];
  }

  public addActivePacket(ap: ActivePacket): void {
    this.activePackets.push(ap);
  }

  public removeActivePacket(packetId: string): void {
    this.activePackets = this.activePackets.filter((ap) => ap.packet.id !== packetId);
  }

  /**
   * Deep clones the current state of the simulation.
   */
  public createSnapshot(): SimulationState {
    return structuredClone({
      devices: Array.from(this.devices.values()),
      links: Array.from(this.links.values()),
      eventQueue: this.eventQueue.getEvents(),
      eventHistory: this.eventHistory,
      activePackets: this.activePackets,
      currentTick: this.currentTick,
    });
  }

  /**
   * Restores the simulation to a specific snapshot state.
   */
  public restoreSnapshot(snapshot: SimulationState): void {
    if (!snapshot || typeof snapshot.currentTick !== 'number') {
      throw new Error('Invalid snapshot state provided');
    }

    const clonedSnapshot = structuredClone(snapshot);

    this.devices.clear();
    for (const dev of clonedSnapshot.devices) {
      this.devices.set(dev.id, dev);
    }

    this.links.clear();
    for (const link of clonedSnapshot.links) {
      this.links.set(link.id, link);
    }

    this.eventQueue.clear();
    for (const evt of clonedSnapshot.eventQueue) {
      this.eventQueue.enqueue(evt);
    }

    this.eventHistory = clonedSnapshot.eventHistory;
    this.activePackets = clonedSnapshot.activePackets || [];
    this.currentTick = clonedSnapshot.currentTick;
  }
}
