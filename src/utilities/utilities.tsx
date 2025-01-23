

/************************************************
* Independent & Universal Utility Functionality *
*************************************************/

import { initializeNotifications } from "./notifications";

export const initializeAppUtils = () => {
    initializeNotifications();
}

//Converts underscores to spaces and capitalizes each word
export const makeDisplayText = (text:string = ''):string => text.toLowerCase().split('_'||' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

export const makeAbbreviatedText = (text: string = '', abbreviateLastWord: boolean = true): string => 
    makeDisplayText(text).split(' ').map((w, i, arr) => (i === arr.length - 1 && !abbreviateLastWord) ? w : w.charAt(0)).join(' ');

