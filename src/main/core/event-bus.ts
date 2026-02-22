/**
 * EventBus — Internal event-driven communication within the main process.
 * Decouples modules by providing a typed publish/subscribe mechanism.
 */

import { EventEmitter } from 'events';
import type {
  TestStep,
  LogEntry,
  RecorderEvent,
  RunnerStatusPayload,
  StepUpdatePayload,
} from '../../shared/types';

/* ------------------------------------------------------------------ */
/*  Event Map                                                          */
/* ------------------------------------------------------------------ */

export interface EventMap {
  'recorder:event': RecorderEvent;
  'recorder:started': { url: string };
  'recorder:stopped': void;
  'recorder:paused': void;
  'recorder:resumed': void;
  'step:added': TestStep;
  'step:updated': TestStep;
  'step:deleted': string;
  'step:reordered': string[];
  'runner:status': RunnerStatusPayload;
  'runner:step-update': StepUpdatePayload;
  'runner:complete': { passed: number; failed: number; total: number };
  'log': LogEntry;
  'browser:navigated': { url: string; title: string };
}

/* ------------------------------------------------------------------ */
/*  Typed EventBus                                                     */
/* ------------------------------------------------------------------ */

class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  on<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void,
  ): void {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
  }

  once<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void,
  ): void {
    this.emitter.once(event, listener as (...args: unknown[]) => void);
  }

  off<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void,
  ): void {
    this.emitter.off(event, listener as (...args: unknown[]) => void);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  removeAllListeners(event?: keyof EventMap): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

/** Singleton event bus for the main process */
export const eventBus = new EventBus();
