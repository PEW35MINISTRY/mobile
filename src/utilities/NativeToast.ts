import { AxiosError } from "axios";
import Toast, { ToastOptions } from "react-native-root-toast";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/toast-types";

const DefaultToastConfig:ToastOptions = {
    duration: Toast.durations.LONG
}

export default class NativeToast {
    static show(error: AxiosError<ServerErrorResponse>, options?:ToastOptions): any {
        const ToastConfig = {...DefaultToastConfig, options}

        // Handle server connection issues
        if (error.code === "ERR_NETWORK") var toast = Toast.show("Unable to connect to the server. Try again later", ToastConfig);

        // Display notification from server
        else if (error.response !== undefined) var toast = Toast.show(error.response.data.notification, ToastConfig);
        
        // Should never get here, but covering for all cases
        else var toast = Toast.show("Server Error", ToastConfig);

    }
}