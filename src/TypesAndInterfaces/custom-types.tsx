import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { JwtResponseBody } from './config-sync/api-type-sync/auth-types';
import { CircleStatusEnum } from './config-sync/input-config-sync/circle-field-config';
import { CircleListItem, CircleResponse } from './config-sync/api-type-sync/circle-types';
import React from 'react';

// screen names for react navigation
export const CIRCLE_SEARCH_ROUTE_NAME = "CircleSearch";
export const CIRCLE_LIST_ROUTE_NAME = "CircleList";
export const CIRCLE_DISPLAY_ROUTE_NAME = "CircleDisplay";

export type StackNavigationProps = NativeStackScreenProps<any>;
export type TabNavigationProps = BottomTabScreenProps<any>;

export type React$Node = JSX.Element | null;

export type RequestAccountHeader = {header: JwtResponseBody}

export interface CircleState {
    circleData: CircleResponse,
    circleDataRequest: CircleListItem
}