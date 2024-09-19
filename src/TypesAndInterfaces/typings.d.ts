declare var global: any;
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

declare module '@env' {
    export const DOMAIN: string;
    export const ENVIRONMENT: string;
    export const SOCKET_PATH: string;
}