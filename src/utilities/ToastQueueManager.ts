import { AxiosError } from "axios";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import { navigationRef } from "../App";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import Toast, { ToastShowParams } from 'react-native-toast-message';

const DefaultToastConfig:ToastShowParams = {
    position: "bottom",
    type: "info"
}

interface ToastQueueManagerParams {
    message: string,
    options?: ToastShowParams,
    callback?: ((value:any) => void),
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
    show({error, options, message, callback}: {error?: AxiosError<ServerErrorResponse>; options?:ToastShowParams; message?:string; callback?:((value:any) => void)}): void {

        const ToastConfig = {...DefaultToastConfig, options}

        if (this.timeoutCount > 2 && !this.isOfflineWarningShown) {
            navigationRef.current?.navigate(ROUTE_NAMES.OFFLINE_WARNING_ROUTE_NAME as unknown as never);
            this.isOfflineWarningShown = true;
        }

        if (error !== undefined) {
            // Handle server connection issues
            if (error.code === "ERR_NETWORK") {
                this.queue.push({message: "Unable to connect to the server. Try again later", options: ToastConfig, callback: callback});

                this.timeoutCount = this.timeoutCount + 1;
            }

            // Display notification from server
            else if (error.response !== undefined) this.queue.push({message: error.response.data.notification, options: ToastConfig, callback: callback});
            
            // Should never get here, but covering for all cases
            else this.queue.push({message: "Server Error", options: ToastConfig});
        }
        else {
            // Display custom message
            if (message !== undefined) this.queue.push({message: message, options: ToastConfig, callback: callback});
            else this.queue.push({message: "Problem displaying message", options: ToastConfig});
        }

        if (!this.isToastVisible) this.showNextToast();
    }


    showNextToast() {
        console.log("showNextToast called");
        if (this.queue.length === 0) return;

        //@ts-ignore - queue will never be empty here
        const toastParams:ToastQueueManagerParams = this.queue.shift();

        this.isToastVisible = true;

        // use setTimeout to toggle next toast; onHide fails in the case of the Toast ref beng lost lost due to the screen becoming unfocused
        setTimeout(() => {
            console.log("hide");
            this.isToastVisible = false;
            this.queue.length === 0 && toastParams.callback !== undefined && toastParams.callback(false);
            this.showNextToast();
        }, 4100)

        Toast.show({
            text1: toastParams.message,
            ...toastParams.options,
        });
       
    }

    resetOfflineWarning() {
        this.timeoutCount = 0;
        this.isOfflineWarningShown = false;
    }
}

export default new ToastQueueManager();