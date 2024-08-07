/********* ONLY DEPENDENCIES FROM DIRECTORY: /field-sync/ *********/

import { PrayerRequestTagEnum } from '../input-config-sync/prayer-request-field-config.js'
import { CircleListItem } from './circle-types.js'
import { ProfileListItem } from './profile-types.js'

/****************************************************************************************
*                   PRAYER REQUEST TYPES                                                *
* Sync across all repositories: server, portal, mobile                                  *
* Server: Additional Types Declared in: 1-api/5-prayer-request/prayer-request-types.mts *
* Portal:                                                                               *
* Mobile:                                                                               *
*****************************************************************************************/

export interface PrayerRequestListItem {
    prayerRequestID: number,
    requestorProfile: ProfileListItem, 
    topic: string,
    prayerCount: number,
    tagList?: PrayerRequestTagEnum[], 
}

export interface PrayerRequestCommentListItem {
    commentID: number,
    prayerRequestID: number,
    commenterProfile: ProfileListItem, 
    message: string,
    likeCount: number
}

export interface PrayerRequestResponseBody {
    prayerRequestID: number,
    requestorID: number,
    topic: string,
    description: string,
    prayerCount: number,
    isOnGoing: boolean,
    isResolved: boolean,
    tagList?: PrayerRequestTagEnum[],
    expirationDate: string,
    commentList?: PrayerRequestCommentListItem[],
    userRecipientList?: ProfileListItem[],
    circleRecipientList?: CircleListItem[],
}

export interface PrayerRequestPostRequestBody {
    requestorID?: number, 
    topic: string,
    description: string,
    prayerCount?: number,
    isOnGoing?: boolean,
    tagList?: string[],
    expirationDate: string,
    addUserRecipientIDList?: number[],
    addCircleRecipientIDList?: number[]
}

export interface PrayerRequestPatchRequestBody extends PrayerRequestPostRequestBody {
    isResolved?: boolean,
    removeUserRecipientIDList?: number[],
    removeCircleRecipientIDList?: number[]
}

export interface PrayerRequestCommentRequestBody {
    message: string
}
