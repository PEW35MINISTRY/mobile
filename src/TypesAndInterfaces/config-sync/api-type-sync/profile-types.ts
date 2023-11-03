/***** ONLY DEPENDENCIES FROM DIRECTORY: Fields-Sync/API-Types-Sync *****/

import { GenderEnum, RoleEnum } from "../input-config-sync/profile-field-config.js"
import { CircleListItem } from "./circle-types.js"

/**********************************************************************
*                   PROFILE TYPES                                     *
* Sync across all repositories: server, portal, mobile                *
* Server: Additional Types Declared in: api/profile/profile-types.mts *
* Portal:                                                             *
* Mobile:                                                             *
***********************************************************************/


/* [TEMPORARY] Credentials fetched for Debugging */
export type CredentialProfile = { 
    userID: number,
    displayName: string,
    userRole: string,
    email: string,
    passwordHash: string,
}

export interface ProfileListItem {
    userID: number,
    firstName: string,
    displayName: string,
    image?: string,
}

export interface ProfilePublicResponse {
    userID: number, 
    userRole: string, 
    firstName: string,
    displayName: string, 
    gender: GenderEnum,
    image?: string,
    circleList?: CircleListItem[],
};

export interface ProfilePartnerResponse extends ProfilePublicResponse {
    walkLevel: number,
};

export interface ProfileResponse extends ProfilePartnerResponse  {
    lastName: string, 
    email:string,
    postalCode: string, 
    dateOfBirth: string,
    isActive: boolean,
    notes?: string,
    userRoleList: RoleEnum[],
    partnerList?: ProfileListItem[],
};

export interface ProfileEditRequestBody {
    firstName?: string, 
    lastName?: string, 
    displayName?: string, 
    email?: string,
    password?: string,
    passwordVerify?: string,
    postalCode?: string, 
    dateOfBirth?: string, 
    gender?: GenderEnum,
    isActive?: boolean,
    walkLevel?: number,
    image?: string,
    notes?: string,
    userRoleTokenList?: [{role: RoleEnum, token: string}]
}
