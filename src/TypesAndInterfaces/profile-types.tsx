import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';

import { GenderEnum } from './profile-field-config';
export type StackNavigationProps = NativeStackScreenProps<any>;
export type TabNavigationProps = BottomTabScreenProps<any>;

export type React$Node = JSX.Element | null;

export type USER = {
    userID: number, 
    firstName: string,
    lastName: string,
    displayName: string,  //Unique
    email: string,        //Unique
    passwordHash: string,
    postalCode: string, 
    dateOfBirth: Date, 
    gender: GenderEnum,
    isActive: boolean,
    walkLevel: number,
    image: string,
};

export enum ToastStyle {
    INFO = 'INFO', 
    WARN = 'WARNING', 
    ERROR = 'ERROR', 
    SUCCESS = 'SUCCESS'
}

export interface ProfileCircleItem {
    circleID: number,
    name: string,
    image: string,
}

export interface ProfilePartnerItem {
    userID: number,
    firstName: string,
    displayName: string,
    image: string,
}

/* Sync between Server and Portal "profile-types" */
export interface ProfilePublicResponse {
    userID: number, 
    isActive: boolean,
    userRole: string, 
    firstName: string,
    displayName: string, 
    gender: GenderEnum,
    image: string,
    circleList: ProfileCircleItem[],
};


/* Sync between Server and Portal "profile-types" */
export interface ProfileResponse extends ProfilePublicResponse  {
    lastName: string, 
    email:string,
    postalCode: string, 
    dateOfBirth: Date,
    walkLevel: number,
    partnerList: ProfilePartnerItem[],
};

//temporary for debugging
type CredentialProfile = { 
    user_id: number,
    display_name: string,
    user_role: string,
    email: string,
    password_hash: string,
}