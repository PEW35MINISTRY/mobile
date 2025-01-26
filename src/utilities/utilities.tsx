

/************************************************
* Independent & Universal Utility Functionality *
*************************************************/

import { ENVIRONMENT } from "@env";
import { ENVIRONMENT_TYPE } from "../TypesAndInterfaces/config-sync/input-config-sync/inputField";
import { initializeNotifications } from "./notifications";

export const initializeAppUtils = () => {
    initializeNotifications();
}

//Converts underscores to spaces and capitalizes each word
export const makeDisplayText = (text:string = ''):string => text.toLowerCase().split('_'||' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

export const makeAbbreviatedText = (text: string = '', abbreviateLastWord: boolean = true): string => 
    makeDisplayText(text).split(' ').map((w, i, arr) => (i === arr.length - 1 && !abbreviateLastWord) ? w : w.charAt(0)).join(' ');

/* Parse Environment | (Don't default to PRODUCTION for security) */
export const getEnvironment = ():ENVIRONMENT_TYPE => ENVIRONMENT_TYPE[ENVIRONMENT as keyof typeof ENVIRONMENT_TYPE] || ENVIRONMENT_TYPE.DEVELOPMENT;