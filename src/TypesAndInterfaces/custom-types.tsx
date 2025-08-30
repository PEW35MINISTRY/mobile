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

export interface CallbackParam {
    callback:(() => void)
}

export enum CALLBACK_STATE {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    EXIT = 'EXIT',
    BACK = 'BACK'

}

export interface StackNavigationProps extends NativeStackScreenProps<any> {};
export interface TabNavigationProps extends BottomTabScreenProps<any> {};

export type React$Node = JSX.Element | null;