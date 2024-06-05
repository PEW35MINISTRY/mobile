import { ParamListBase } from "@react-navigation/native"
import { CircleListItem } from "./config-sync/api-type-sync/circle-types"
import { PrayerRequestListItem } from "./config-sync/api-type-sync/prayer-request-types"
import { CircleDisplayParamList } from "../2-Circles/CircleDisplay"
import { PrayerRequestDisplayParamList } from "../3-Prayer-Request/PrayerRequestDisplay"

export enum ROUTE_NAMES {
    LOGIN_ROUTE_NAME = "LOGIN",
    SIGNUP_ROUTE_NAME = "SIGN_UP",
    EDIT_PROFILE_ROUTE_NAME = "EDIT_PROFILE",
    CIRCLE_SEARCH_ROUTE_NAME = "CircleSearch",
    CIRCLE_LIST_ROUTE_NAME = "CircleList",
    CIRCLE_DISPLAY_ROUTE_NAME = "CircleDisplay",
    CIRCLE_NAVIGATOR_ROUTE_NAME = "CircleRoutes",
    BOTTOM_TAB_NAVIGATOR_ROUTE_NAME = "BottomTabNavigator",
    CONTENT_NAVIGATOR_ROUTE_NAME = "ContentRoutes",
    PROFILE_SETTINGS_NAVIGATOR_ROUTE_NAME = "ProfileSettingsRoutes",
    PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME = "PrayerRequestRoutes",
    PRAYER_REQUEST_DISPLAY_ROUTE_NAME = "PrayerRequestDisplay",
    PRAYER_REQUEST_LIST_ROUTE_NAME = "PrayerRequestList",
    INITIAL_ACCOUNT_FLOW_ROUTE_NAME = "InitialAccountFlow",
    PROFILE_SETTINGS_ROUTE_NAME = "ProfileSettings"
}

export enum BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES {
    CIRCLE_NAVIGATOR_ROUTE_NAME = "CircleRoutes",
    PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME = "PrayerRequestRoutes",
    CONTENT_NAVIGATOR_ROUTE_NAME = "ContentRoutes",
    PROFILE_SETTINGS_NAVIGATOR_ROUTE_NAME = "ProfileSettingsRoutes",
}

export interface AppStackParamList extends ParamListBase {
    [ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME]:undefined,
    [ROUTE_NAMES.CIRCLE_LIST_ROUTE_NAME]:undefined,
    [ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME]:CircleDisplayParamList,
    [ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME]:PrayerRequestDisplayParamList,
}
