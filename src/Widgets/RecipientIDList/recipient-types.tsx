import { CircleListItem } from "../../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { ProfileListItem } from "../../TypesAndInterfaces/config-sync/api-type-sync/profile-types";

export enum RecipientStatusEnum {
    NOT_SELECTED = "Share",
    CONFIRMED = "Remove",
    UNCONFIRMED_ADD = "Pending",
    UNCONFIRMED_REMOVE = "Pending"
}

export enum RecipientFormViewMode {
    EDITING = "EDITING",
    CREATING = "CREATING"
}

export interface RecipientFormCircleListItem extends CircleListItem {
    recipientStatus: RecipientStatusEnum, // flag for displaying the list item at the top of selection list
    viewMode: RecipientFormViewMode, // differentiating between editing and creating; helps determine what functions to call to add/remove user/circle to correct list
}

export interface RecipientFormProfileListItem extends ProfileListItem {
    recipientStatus: RecipientStatusEnum, // flag for displaying the list item at the top of selection list
    viewMode: RecipientFormViewMode, // differentiating between editing and creating; helps determine what functions to call to add/remove user/circle to correct list
}