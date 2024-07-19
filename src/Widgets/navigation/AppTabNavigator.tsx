import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../theme";
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from "../../TypesAndInterfaces/routes";
import { RootState, setTabFocus } from "../../redux-store";
import { useAppDispatch, useAppSelector } from "../../TypesAndInterfaces/hooks";

export const AppTabNavigator = (props:BottomTabBarProps):JSX.Element => {
    const CIRCLE_NAVIGATOR_ICON_SELECTED = require('../../../assets/circle-icon-red.png')
    const CIRCLE_NAVIGATOR_ICON_NOT_SELECTED = require('../../../assets/circle-icon-gray.png');
    const PRAYER_REQUEST_NAVIGATOR_ICON_SELECTED = require('../../../assets/prayer-request-icon-red.png')
    const PRAYER_REQUEST_NAVIGATOR_ICON_NOT_SELECTED = require('../../../assets/prayer-request-icon-gray.png');

    const dispatch = useAppDispatch();
    const focusedTab = useAppSelector((state: RootState) => state.navigationTab.focusedTab);

    const changeTab = (screenName:BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES) => {
        dispatch(setTabFocus(screenName))
        props.navigation.navigate(screenName);
    }

    const styles = StyleSheet.create({
        container: {
            justifyContent: "center",
            backgroundColor: COLORS.black,
            flexDirection: "row",
        },
        padding: {
            justifyContent: "space-evenly",
            flexDirection: "row",
            marginBottom: 15, 
        },
        navTouchable: {
            backgroundColor: COLORS.black,
            borderRadius: 28,
            marginHorizontal: 30,
        },
    });


    return (
        <View style={styles.container}>
            <View style={styles.padding}>
                <TouchableOpacity
                    style={styles.navTouchable}
                    onPress={() => changeTab(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME)}
                >
                    
                    <Ionicons
                        name="home"
                        color={(focusedTab === BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navTouchable}
                    onPress={() => changeTab(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME)}
                >
                    {
                        focusedTab === BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME ? <Image source={CIRCLE_NAVIGATOR_ICON_SELECTED} style={{height: 55, width: 55}}/> : <Image source={CIRCLE_NAVIGATOR_ICON_NOT_SELECTED} style={{height: 55, width: 55}}/>
                    }
                    
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navTouchable}
                    onPress={() => changeTab(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME)}
                >
                    {
                        focusedTab === BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME ? <Image source={PRAYER_REQUEST_NAVIGATOR_ICON_SELECTED} style={{height: 55, width: 55}}/> : <Image source={PRAYER_REQUEST_NAVIGATOR_ICON_NOT_SELECTED} style={{height: 55, width: 55}}/>
                    }
                    
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navTouchable}
                    onPress={() => changeTab(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME)}
                >
                    <Ionicons
                        name="library"
                        color={(focusedTab === BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
            </View>

        </View>
    )
}

