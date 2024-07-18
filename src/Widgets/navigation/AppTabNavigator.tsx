import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../theme";
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from "../../TypesAndInterfaces/routes";

export const AppTabNavigator = (props:BottomTabBarProps):JSX.Element => {
    const CIRCLE_NAVIGATOR_ICON_SELECTED = require('../../../assets/circle-icon-red.png')
    const CIRCLE_NAVIGATOR_ICON_NOT_SELECTED = require('../../../assets/circle-icon-gray.png');
    const PRAYER_REQUEST_NAVIGATOR_ICON_SELECTED = require('../../../assets/prayer-request-icon-red.png')
    const PRAYER_REQUEST_NAVIGATOR_ICON_NOT_SELECTED = require('../../../assets/prayer-request-icon-gray.png');

    // Because I can't refer to the value of other objects in a static object declaration, generate the object dynamically
    const generateDefaultNavigationState = () => {
        var defaultNavigationState:Record<string, boolean> = {};
        Object.values(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES).forEach((route) => {
            defaultNavigationState[route] = false;
        })
        return defaultNavigationState;
    }

    const defaultNavigationState:Record<string, boolean> = generateDefaultNavigationState();
    const [isFocused, setIsFocused] = useState<Record<string, boolean>>(defaultNavigationState);

    const changeTab = (screenName:string) => {
        var newState = {...defaultNavigationState};
        newState[screenName] = true;
        setIsFocused(newState);
        props.navigation.navigate(screenName);
    }

    const styes = StyleSheet.create({
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
   
    useEffect(() => {
        var newState = {...defaultNavigationState};
        newState[ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME] = true;
        setIsFocused(newState);
    }, [])

    return (
        <View style={styes.container}>
            <View style={styes.padding}>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME)}
                >
                    
                    <Ionicons
                        name="home"
                        color={(isFocused[ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME)}
                >
                    {
                        isFocused[ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME] ? <Image source={CIRCLE_NAVIGATOR_ICON_SELECTED} style={{height: 55, width: 55}}/> : <Image source={CIRCLE_NAVIGATOR_ICON_NOT_SELECTED} style={{height: 55, width: 55}}/>
                    }
                    
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME)}
                >
                    {
                        isFocused[ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME] ? <Image source={PRAYER_REQUEST_NAVIGATOR_ICON_SELECTED} style={{height: 55, width: 55}}/> : <Image source={PRAYER_REQUEST_NAVIGATOR_ICON_NOT_SELECTED} style={{height: 55, width: 55}}/>
                    }
                    
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME)}
                >
                    <Ionicons
                        name="library"
                        color={(isFocused[ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
            </View>

        </View>
    )
}