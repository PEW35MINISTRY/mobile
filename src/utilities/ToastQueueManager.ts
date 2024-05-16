import { AxiosError } from "axios";
import Toast, { ToastOptions } from "react-native-root-toast";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/toast-types";

const DefaultToastConfig:ToastOptions = {
    duration: Toast.durations.LONG
}

interface ToastQueueManagerParams {
    message: string,
    options?: ToastOptions
}

class ToastQueueManager {

    queue: ToastQueueManagerParams[];
    isToastVisible: boolean

    constructor() {
        this.queue = [];
        this.isToastVisible = false;
    }

    show(error: AxiosError<ServerErrorResponse>, options?:ToastOptions): any {
        const ToastConfig = {...DefaultToastConfig, options}

         // Handle server connection issues
         if (error.code === "ERR_NETWORK") this.queue.push({message: "Unable to connect to the server. Try again later", options: ToastConfig});

         // Display notification from server
         else if (error.response !== undefined) this.queue.push({message: error.response.request.notification, options: ToastConfig})
         
         // Should never get here, but covering for all cases
         else this.queue.push({message: "Server Error", options: ToastConfig});


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
}

export default new ToastQueueManager();