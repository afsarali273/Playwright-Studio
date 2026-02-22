"use strict";
/**
 * Typed IPC channel definitions.
 * Both main and renderer import these to ensure type-safe communication.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
exports.IpcChannels = {
    /* ---- Recorder ---- */
    RECORDER_START: 'recorder:start',
    RECORDER_STOP: 'recorder:stop',
    RECORDER_PAUSE: 'recorder:pause',
    RECORDER_RESUME: 'recorder:resume',
    RECORDER_ADD_ASSERTION: 'recorder:add-assertion',
    RECORDER_EVENT: 'recorder:event',
    RECORDER_EVENT_FROM_PAGE: 'recorder:event-from-page',
    RECORDER_STATUS: 'recorder:status',
    /* ---- Runner ---- */
    RUNNER_RUN_ALL: 'runner:run-all',
    RUNNER_RUN_FROM: 'runner:run-from',
    RUNNER_RUN_STEP: 'runner:run-step',
    RUNNER_PAUSE: 'runner:pause',
    RUNNER_STOP: 'runner:stop',
    RUNNER_STATUS: 'runner:status',
    RUNNER_STEP_UPDATE: 'runner:step-update',
    RUNNER_COMPLETE: 'runner:complete',
    /* ---- Steps ---- */
    STEP_ADDED: 'step:added',
    STEP_GET_ALL: 'steps:get-all',
    STEP_UPDATE: 'steps:update',
    STEP_DELETE: 'steps:delete',
    STEP_REORDER: 'steps:reorder',
    STEP_CLEAR: 'steps:clear',
    /* ---- Generator ---- */
    GENERATOR_EXPORT: 'generator:export',
    GENERATOR_RESULT: 'generator:result',
    /* ---- Project / Storage ---- */
    PROJECT_NEW: 'project:new',
    PROJECT_OPEN: 'project:open',
    PROJECT_SAVE: 'project:save',
    PROJECT_GET_CONFIG: 'project:get-config',
    PROJECT_UPDATE_CONFIG: 'project:update-config',
    /* ---- Browser ---- */
    BROWSER_NAVIGATE: 'browser:navigate',
    BROWSER_SET_BOUNDS: 'browser:set-bounds',
    BROWSER_NAVIGATED: 'browser:navigated',
    BROWSER_BACK: 'browser:back',
    BROWSER_FORWARD: 'browser:forward',
    BROWSER_RELOAD: 'browser:reload',
    BROWSER_LIST_EXTERNAL: 'browser:list-external',
    BROWSER_ATTACH: 'browser:attach',
    BROWSER_SET_TYPE: 'browser:set-type',
    BROWSER_HIDE: 'browser:hide',
    BROWSER_SHOW: 'browser:show',
    /* ---- Inspector ---- */
    INSPECTOR_ENABLE: 'inspector:enable',
    INSPECTOR_DISABLE: 'inspector:disable',
    INSPECTOR_PICK: 'inspector:pick',
    INSPECTOR_EVENT_FROM_PAGE: 'inspector:event-from-page',
    INSPECTOR_VALIDATE_LOCATOR: 'inspector:validate-locator',
    /* ---- Logs ---- */
    LOG_EVENT: 'log:event',
    LOG_CLEAR: 'log:clear',
};
//# sourceMappingURL=ipc-channels.js.map