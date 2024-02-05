import { ParamListBase } from "@react-navigation/native"
import { CircleListItem } from "./config-sync/api-type-sync/circle-types"
import { PrayerRequestListItem } from "./config-sync/api-type-sync/prayer-request-types"
import { CircleDisplayParamList } from "../2-Circles/CircleDisplay"

export enum ROUTE_NAMES {
    CIRCLE_SEARCH_ROUTE_NAME = "CircleSearch",
    CIRCLE_LIST_ROUTE_NAME = "CircleList",
    CIRCLE_DISPLAY_ROUTE_NAME = "CircleDisplay",
    CIRCLE_NAVIGATOR_ROUTE_NAME = "CircleRoutes",
    BOTTOM_TAB_NAVIGATOR_ROUTE_NAME = "BottomTabNavigator",
    CONTENT_NAVIGATOR_ROUTE_NAME = "ContentRoutes",
    PROFILE_SETTINGS_NAVIGATOR_ROUTE_NAME = "ProfileSettingsRoutes",
    PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME = "PrayerRequestRoutes",
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
}
