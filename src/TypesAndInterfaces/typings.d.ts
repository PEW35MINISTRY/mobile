declare var global: any;
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

declare module '@env' {
    export const DOMAIN: string;
    export const ENVIRONMENT: string;
    export const NEW_PARTNER_REQUEST_TIMEOUT: string;
    export const SETTINGS_VERSION: string;
    export const FOREVER_PRAYER_REQUEST_DURATION_DAYS: string;
    export const FOREVER_PRAYER_REQUEST_DURATION_ISO: string;
}