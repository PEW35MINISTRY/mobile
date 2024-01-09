import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { JwtResponseBody } from './config-sync/api-type-sync/auth-types';
import { CircleListItem, CircleResponse } from './config-sync/api-type-sync/circle-types';
import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import { SUPPORTED_IMAGE_EXTENSION_LIST } from './config-sync/input-config-sync/inputField';

export const PROFILE_IMAGE_MIME_TYPES = SUPPORTED_IMAGE_EXTENSION_LIST.map((extension) => "image/" + extension);

// screen names for react navigation
export const CIRCLE_SEARCH_ROUTE_NAME = "CircleSearch";
export const CIRCLE_LIST_ROUTE_NAME = "CircleList";
export const CIRCLE_DISPLAY_ROUTE_NAME = "CircleDisplay";
export const CIRCLE_NAVIGATOR_ROUTE_NAME = "CircleRoutes";
export const BOTTOM_TAB_NAVIGATOR_ROUTE_NAME = "BottomTabNavigator";

export interface ProfileImageSettingsParams extends ParamListBase {
    callback:(() => void)
}

export interface AppStackParamList extends ParamListBase {
    [CIRCLE_SEARCH_ROUTE_NAME]:undefined,
    [CIRCLE_LIST_ROUTE_NAME]:undefined,
    [CIRCLE_DISPLAY_ROUTE_NAME]:CircleDisplayParamList,
}

export interface CircleDisplayParamList extends AppStackParamList {
    CircleProps: CircleListItem
}
export interface StackNavigationProps extends NativeStackScreenProps<any> {};

export interface TabNavigationProps extends BottomTabScreenProps<any> {};

export type React$Node = JSX.Element | null;

export type CircleDisplayProps = NativeStackScreenProps<CircleDisplayParamList, typeof CIRCLE_DISPLAY_ROUTE_NAME>;
