import { DebugSession } from "vscode";
import { activeDebugSessionData } from "../debugger-utils/DebugSessionsHolder";
import { logDebug } from "../Logging";
import { debounce } from "../utils/Utils";
import { verifyModuleExistsCode, viewablesSetupCode } from "./BuildPythonCode";
import { evaluateInPython, execInPython } from "./RunPythonCode";

function checkSetupOkay(session: DebugSession) {
    return evaluateInPython(verifyModuleExistsCode(), session);
}

export async function runSetup(session: DebugSession): Promise<void> {
    const debugSessionData = activeDebugSessionData(session);
    let maxTries = 5;

    const trySetupExtensionAndRunAgainIfFailed = async (): Promise<void> => {
        logDebug("Checks setup is okay or not");
        const isSetupOkay = await checkSetupOkay(session);

        if (isSetupOkay.isError || !isSetupOkay.result) {
            if (maxTries <= 0) {
                throw new Error("Setup failed");
            }

            debugSessionData.setupOkay = false;

            maxTries -= 1;
            logDebug("No setup. Run setup code");
            await execInPython(viewablesSetupCode(), session);
            // run again to make sure setup is okay
            return trySetupExtensionAndRunAgainIfFailedDebounced();
        } else {
            logDebug("Setup is okay");
            debugSessionData.setupOkay = true;
        }
    };

    const trySetupExtensionAndRunAgainIfFailedDebounced = debounce(
        trySetupExtensionAndRunAgainIfFailed,
        250
    );

    return trySetupExtensionAndRunAgainIfFailed();
}
