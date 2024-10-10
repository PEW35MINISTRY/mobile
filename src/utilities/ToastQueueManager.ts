import { AxiosError } from "axios";
import Toast, { ToastOptions } from "react-native-root-toast";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import { useState } from "react";
import { navigationRef } from "../App";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";

const DefaultToastConfig:ToastOptions = {
    duration: Toast.durations.LONG
}

interface ToastQueueManagerParams {
    message: string,
    options?: ToastOptions
}

class ToastQueueManager {

    timeoutCount: number;
    queue: ToastQueueManagerParams[];
    isToastVisible: boolean;
    isOfflineWarningShown: boolean;

    constructor() {
        this.queue = [];
        this.isToastVisible = false;
        this.timeoutCount = 0;
        this.isOfflineWarningShown = false;
    }
    show({error, options, message}: {error?: AxiosError<ServerErrorResponse>; options?:ToastOptions; message?:string}): void {

        const ToastConfig = {...DefaultToastConfig, options}

        if (this.timeoutCount > 2 && !this.isOfflineWarningShown) {
            navigationRef.current?.navigate(ROUTE_NAMES.OFFLINE_WARNING_ROUTE_NAME as unknown as never)
            this.isOfflineWarningShown = true;
        }

        if (error !== undefined) {
            // Handle server connection issues
            if (error.code === "ERR_NETWORK") {
                this.queue.push({message: "Unable to connect to the server. Try again later", options: ToastConfig});

                this.timeoutCount = this.timeoutCount + 1;
            }

            // Display notification from server
            else if (error.response !== undefined) this.queue.push({message: error.response.data.notification, options: ToastConfig});
            
            // Should never get here, but covering for all cases
            else this.queue.push({message: "Server Error", options: ToastConfig});
        }
        else {
            // Display custom message
            if (message !== undefined) this.queue.push({message: message, options: ToastConfig});
            else this.queue.push({message: "Problem displaying message", options: ToastConfig});
        }

        if (!this.isToastVisible) this.showNextToast();
    }


    showNextToast() {
        if (this.queue.length === 0) return;

        //@ts-ignore - queue will never be empty here
        const toastParams:ToastQueueManagerParams = this.queue.shift();

        this.isToastVisible = true;

        Toast.show(toastParams.message, {
            ...toastParams.options,
            onHidden: () => {
                this.isToastVisible = false;
                this.showNextToast();
            }
        });
       
    }

    resetOfflineWarning() {
        this.timeoutCount = 0;
        this.isOfflineWarningShown = false;
    }
}

export default new ToastQueueManager();