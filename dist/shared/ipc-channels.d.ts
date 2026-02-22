/**
 * Typed IPC channel definitions.
 * Both main and renderer import these to ensure type-safe communication.
 */
export declare const IpcChannels: {
    readonly RECORDER_START: "recorder:start";
    readonly RECORDER_STOP: "recorder:stop";
    readonly RECORDER_PAUSE: "recorder:pause";
    readonly RECORDER_RESUME: "recorder:resume";
    readonly RECORDER_ADD_ASSERTION: "recorder:add-assertion";
    readonly RECORDER_EVENT: "recorder:event";
    readonly RECORDER_EVENT_FROM_PAGE: "recorder:event-from-page";
    readonly RECORDER_STATUS: "recorder:status";
    readonly RUNNER_RUN_ALL: "runner:run-all";
    readonly RUNNER_RUN_FROM: "runner:run-from";
    readonly RUNNER_RUN_STEP: "runner:run-step";
    readonly RUNNER_PAUSE: "runner:pause";
    readonly RUNNER_STOP: "runner:stop";
    readonly RUNNER_STATUS: "runner:status";
    readonly RUNNER_STEP_UPDATE: "runner:step-update";
    readonly RUNNER_COMPLETE: "runner:complete";
    readonly STEP_ADDED: "step:added";
    readonly STEP_GET_ALL: "steps:get-all";
    readonly STEP_UPDATE: "steps:update";
    readonly STEP_DELETE: "steps:delete";
    readonly STEP_REORDER: "steps:reorder";
    readonly STEP_CLEAR: "steps:clear";
    readonly GENERATOR_EXPORT: "generator:export";
    readonly GENERATOR_RESULT: "generator:result";
    readonly PROJECT_NEW: "project:new";
    readonly PROJECT_OPEN: "project:open";
    readonly PROJECT_SAVE: "project:save";
    readonly PROJECT_GET_CONFIG: "project:get-config";
    readonly PROJECT_UPDATE_CONFIG: "project:update-config";
    readonly BROWSER_NAVIGATE: "browser:navigate";
    readonly BROWSER_SET_BOUNDS: "browser:set-bounds";
    readonly BROWSER_NAVIGATED: "browser:navigated";
    readonly BROWSER_BACK: "browser:back";
    readonly BROWSER_FORWARD: "browser:forward";
    readonly BROWSER_RELOAD: "browser:reload";
    readonly BROWSER_LIST_EXTERNAL: "browser:list-external";
    readonly BROWSER_ATTACH: "browser:attach";
    readonly BROWSER_SET_TYPE: "browser:set-type";
    readonly BROWSER_HIDE: "browser:hide";
    readonly BROWSER_SHOW: "browser:show";
    readonly INSPECTOR_ENABLE: "inspector:enable";
    readonly INSPECTOR_DISABLE: "inspector:disable";
    readonly INSPECTOR_PICK: "inspector:pick";
    readonly INSPECTOR_EVENT_FROM_PAGE: "inspector:event-from-page";
    readonly INSPECTOR_VALIDATE_LOCATOR: "inspector:validate-locator";
    readonly LOG_EVENT: "log:event";
    readonly LOG_CLEAR: "log:clear";
};
export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
//# sourceMappingURL=ipc-channels.d.ts.map