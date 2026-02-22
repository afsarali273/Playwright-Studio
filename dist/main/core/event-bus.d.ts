/**
 * EventBus — Internal event-driven communication within the main process.
 * Decouples modules by providing a typed publish/subscribe mechanism.
 */
import type { TestStep, LogEntry, RecorderEvent, RunnerStatusPayload, StepUpdatePayload } from '../../shared/types';
export interface EventMap {
    'recorder:event': RecorderEvent;
    'recorder:started': {
        url: string;
    };
    'recorder:stopped': void;
    'recorder:paused': void;
    'recorder:resumed': void;
    'step:added': TestStep;
    'step:updated': TestStep;
    'step:deleted': string;
    'step:reordered': string[];
    'runner:status': RunnerStatusPayload;
    'runner:step-update': StepUpdatePayload;
    'runner:complete': {
        passed: number;
        failed: number;
        total: number;
    };
    'log': LogEntry;
    'browser:navigated': {
        url: string;
        title: string;
    };
}
declare class EventBus {
    private emitter;
    constructor();
    on<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): void;
    once<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): void;
    off<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): void;
    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
    removeAllListeners(event?: keyof EventMap): void;
}
/** Singleton event bus for the main process */
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=event-bus.d.ts.map