"use strict";
/**
 * EventBus — Internal event-driven communication within the main process.
 * Decouples modules by providing a typed publish/subscribe mechanism.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
const events_1 = require("events");
/* ------------------------------------------------------------------ */
/*  Typed EventBus                                                     */
/* ------------------------------------------------------------------ */
class EventBus {
    emitter = new events_1.EventEmitter();
    constructor() {
        this.emitter.setMaxListeners(50);
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    once(event, listener) {
        this.emitter.once(event, listener);
    }
    off(event, listener) {
        this.emitter.off(event, listener);
    }
    emit(event, payload) {
        this.emitter.emit(event, payload);
    }
    removeAllListeners(event) {
        if (event) {
            this.emitter.removeAllListeners(event);
        }
        else {
            this.emitter.removeAllListeners();
        }
    }
}
/** Singleton event bus for the main process */
exports.eventBus = new EventBus();
//# sourceMappingURL=event-bus.js.map