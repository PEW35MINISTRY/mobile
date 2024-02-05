import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Text, GestureResponderEvent, ImageSourcePropType, ImageStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { CircleListItem, CircleAnnouncementListItem, CircleEventListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";

export const CircleTabNavigator = (props:BottomTabBarProps):JSX.Element => {

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
        newState[ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME] = true;
        setIsFocused(newState);
    }, [])

    return (
        <View style={styes.container}>
            <View style={styes.padding}>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME)}
                >
                    
                    <Ionicons
                        name="home"
                        color={(isFocused[ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME)}
                >
                    <Ionicons
                        name="accessibility"
                        color={(isFocused[ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Learn")}
                >
                    <Ionicons
                        name="library"
                        color={(isFocused["Learn"] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Profile")}
                >
                    <Ionicons
                        name="person-circle"
                        color={(isFocused["Profile"] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
            </View>

        </View>
    )
}

export const RequestorCircleImage = (props:{style?:ImageStyle, imageUri?:string, circleID?:number}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const DEFAULT_CIRCLE_ICON = require("../../assets/circle-icon-blue.png");
    const [requestorImage, setRequestorImage] = useState<ImageSourcePropType>(DEFAULT_CIRCLE_ICON);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }
    const styles = StyleSheet.create({
        circleImage: {
            height: 100,
            width: 100,
            borderRadius: 15,
            alignSelf: "center",
            ...props.style
        },
    })

    const fetchCircleImage = async () => {
        await axios.get(`${DOMAIN}/api/user/` + props.circleID + '/image', RequestAccountHeader).then(response => {
            setRequestorImage({uri: response.data})
        }).catch((error:AxiosError) => {console.log(error)})
    }

    useEffect(() => {
        if (props.imageUri !== undefined) setRequestorImage({uri: props.imageUri})
        else if (props.circleID !== undefined) fetchCircleImage();
    }, [])

    return <Image source={requestorImage} style={styles.circleImage}></Image> 
}

export const CircleTouchable = (props:{circleProps: CircleListItem, onPress:(() => void)}):JSX.Element => {
    const styles = StyleSheet.create({
        opacity: {
            width: 250,
            height: 100,
            borderRadius: 10,

        },
        header: {
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            width: 250,
            height: 65,
            borderRadius: 15,

        },
        column: {
            flexDirection: "column",
            width: 200,
            height: 55,
        },
        circleNameText: {
            ...theme.title,
            fontSize: 20,
            textAlign: "center"
        },
        circleImage: {
            height: 50,
            width: 50,
            borderRadius: 40,
            alignSelf: "center"
        },
    });
    return (
        <View>
            <TouchableOpacity
                onPress={props.onPress}
                style={styles.opacity}
            >
                <View style={styles.header}>
                    <RequestorCircleImage 
                        imageUri={props.circleProps.image}
                        circleID={props.circleProps.circleID}
                        style={styles.circleImage}
                    />
                    <View style={styles.column}>
                        <Text style={styles.circleNameText}>{props.circleProps.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const EventTouchable = (props:{circleEvent:CircleEventListItem, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {
    const styles = StyleSheet.create({
        header: {
            width: 200,
            height: 150,
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            justifyContent: "center"
        },
        container: {    
            justifyContent: "center",
            alignItems: "center"
        },
        opacity: {
            width: 200,
            height: 150,
            borderRadius: 15,
            marginHorizontal: 5,
        },
        titleText: {
            ...theme.primary,
            color: COLORS.primary,
            alignSelf: "center",
            //lineHeight: 15,
            fontWeight: "800",
        },
        descriptionText: {
            ...theme.text,
            color: COLORS.white,
            alignSelf: "center",
            alignItems: "center",
            justifyContent:"center",
            textAlign: "center",
            fontSize: FONT_SIZES.S,
        },
        timeText: {
            ...theme.text,
            color: COLORS.white,
            alignSelf: "center",
            fontSize: 8,
            //lineHeight: 15
            marginBottom: 12,
        },
        eventImage: {
            height: 100,
            width: 190,
            borderRadius: 5,
            alignSelf: "center",
        },
        floating: {
            position: "absolute",
            alignSelf: "center",
            justifyContent: "center",
            backgroundColor: COLORS.grayDark+'ce',
            borderRadius: 10,
            top: 62,
            width: 145,
            height: 48,
        },
        descriptionView: {
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            flex: 1,
            width: 185
        }

    })
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={props.onPress}
                style={styles.opacity}

            >
                <View style={styles.header}>
                    <Image source={{uri: props.circleEvent.image}} style={styles.eventImage} />
                    <View style={styles.floating}>
                        <Text style={styles.titleText}>{props.circleEvent.name}</Text>
                        <Text style={styles.timeText}>{new Date(props.circleEvent.startDate as unknown as string).toDateString()}</Text>
                    </View>
                    <View style={styles.descriptionView}>
                        <Text style={styles.descriptionText}>{props.circleEvent.description}</Text>
                    </View>
                    

                </View>

            </TouchableOpacity>
        </View>
    );
}

