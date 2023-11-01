/***** ONLY DEPENDENCIES FROM DIRECTORY: Fields-Sync/API-Types-Sync *****/

import { RoleEnum } from "../input-config-sync/profile-field-config.js"

/****************************************************************
*                   AUTH TYPES                                  *
* Sync across all repositories: server, portal, mobile          *
* Server: Additional Types Declared in: api/auth/auth-types.mts *
* Portal:                                                       *
* Mobile:                                                       *
*****************************************************************/

export interface LoginRequestBody {
    email: string, 
    password: string
};

export interface JwtResponseBody {
    jwt: string, 
    userID: number, 
    userRole: RoleEnum
};
