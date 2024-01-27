import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';

import { CircleListItem, CircleResponse } from './config-sync/api-type-sync/circle-types';
import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import InputField, { SUPPORTED_IMAGE_EXTENSION_LIST } from './config-sync/input-config-sync/inputField';
import { ProfileResponse } from './config-sync/api-type-sync/profile-types';
import { PrayerRequestListItem, PrayerRequestResponseBody } from './config-sync/api-type-sync/prayer-request-types';
import { PrayerRequestTagEnum } from './config-sync/input-config-sync/prayer-request-field-config';

export const PROFILE_IMAGE_MIME_TYPES = SUPPORTED_IMAGE_EXTENSION_LIST.map((extension) => "image/" + extension);

// screen names for react navigation
export const CIRCLE_SEARCH_ROUTE_NAME = "CircleSearch";
export const CIRCLE_LIST_ROUTE_NAME = "CircleList";
export const CIRCLE_DISPLAY_ROUTE_NAME = "CircleDisplay";
export const CIRCLE_NAVIGATOR_ROUTE_NAME = "CircleRoutes";
export const PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME = "PrayerRequestRoutes";
export const BOTTOM_TAB_NAVIGATOR_ROUTE_NAME = "BottomTabNavigator";
export const PRAYER_REQUEST_LIST_ROUTE_NAME = "PrayerRequestList";
export const PRAYER_REQUEST_DISPLAY_ROUTE_NAME = "PrayerRequestDisplay"
export const CONTENT_NAVIGATOR_ROUTE_NAME = "ContentRoutes";
export const PROFILE_SETTINGS_NAVIGATOR_ROUTE_NAME = "ProfileSettingsRoutes"

export const BOTTON_TAB_NAVIGATOR_ROUTE_NAMES = [CIRCLE_NAVIGATOR_ROUTE_NAME, PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, CONTENT_NAVIGATOR_ROUTE_NAME, PROFILE_SETTINGS_NAVIGATOR_ROUTE_NAME];

export enum PrayerRequestViewMode {
    RECIPIENT = "RECIPIENT",
    OWNER = "OWNER"
}

export interface CallbackParam {
    callback:(() => void)
}

export interface SelectListItem {
    key: string | number, 
    value:string
}

export type FormSubmit = {
    onHandleSubmit: () => void;
}

export type FormInputProps = {
    fields:InputField[], 
    defaultValues?:ProfileResponse | PrayerRequestResponseBody, 
    onSubmit:((formValues:Record<string, string>) => void)
}

export interface AppStackParamList extends ParamListBase {
    [CIRCLE_SEARCH_ROUTE_NAME]:undefined,
    [CIRCLE_LIST_ROUTE_NAME]:undefined,
    [CIRCLE_DISPLAY_ROUTE_NAME]:CircleDisplayParamList,
    [PRAYER_REQUEST_DISPLAY_ROUTE_NAME]:PrayerRequestDisplayParamList
}

export interface CircleDisplayParamList extends AppStackParamList {
    CircleProps: CircleListItem
}

export interface PrayerRequestDisplayParamList extends AppStackParamList {
    PrayerRequestProps: PrayerRequestListItem
}

export interface StackNavigationProps extends NativeStackScreenProps<any> {};

export interface TabNavigationProps extends BottomTabScreenProps<any> {};

export type React$Node = JSX.Element | null;

export type CircleDisplayProps = NativeStackScreenProps<CircleDisplayParamList, typeof CIRCLE_DISPLAY_ROUTE_NAME>;
export type PrayerRequestDisplayProps = NativeStackScreenProps<PrayerRequestDisplayParamList, typeof PRAYER_REQUEST_DISPLAY_ROUTE_NAME>;