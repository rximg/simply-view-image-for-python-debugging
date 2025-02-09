import * as vscode from "vscode";
import { getConfiguration } from "./config";

enum LogLevel {
    None = 0,
    Trace = 1,
    Debug = 2,
    Info = 3,
    Warn = 4,
    Error = 5,
}
let logLevel: LogLevel = LogLevel.Trace;
let outputChannel: vscode.OutputChannel | undefined;

export function initLog(): void {
    const debug = getConfiguration("debug");
    if (debug !== "none" && outputChannel === undefined) {
        outputChannel = vscode.window.createOutputChannel(
            "View Image for Python"
        );
    } else if (debug === "none" && outputChannel !== undefined) {
        outputChannel.dispose();
        outputChannel = undefined;
    }

    switch (debug) {
        case "verbose":
            logLevel = LogLevel.Trace;
            break;
        case "debug":
            logLevel = LogLevel.Debug;
            break;
        default:
            logLevel = LogLevel.None;
            break;
    }
}

function log(...obj: any[]): void {
    if (outputChannel === undefined) {
        return;
    }
    outputChannel.appendLine(
        obj.map((o) => JSON.stringify(o, null, 2)).join(" ")
    );
}

// ts-unused-exports:disable-next-line
export function logTrace(...obj: any[]): void {
    if (logLevel <= LogLevel.Trace) log(...obj);
}

// ts-unused-exports:disable-next-line
export function logDebug(...obj: any[]): void {
    if (logLevel <= LogLevel.Debug) log(...obj);
}

// ts-unused-exports:disable-next-line
export function logInfo(...obj: any[]): void {
    if (logLevel <= LogLevel.Info) log(...obj);
}

// ts-unused-exports:disable-next-line
export function logWarn(...obj: any[]): void {
    if (logLevel <= LogLevel.Warn) log(...obj);
}

// ts-unused-exports:disable-next-line
export function logError(...obj: any[]): void {
    if (logLevel <= LogLevel.Error) log(...obj);
}
