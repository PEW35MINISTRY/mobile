import { TouchableOpacity, View, Image, SafeAreaView, StyleSheet, Text } from "react-native"
import React, { useEffect, useRef, useState } from 'react';
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
//@ts-ignore - the file exists
import OFFLINE_LOGO from '../../assets/offline-tomb.png';
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { StackActions } from '@react-navigation/native';
import { Raised_Button } from "../widgets";
import theme, { COLORS, FONTS } from "../theme";
import keychain from 'react-native-keychain'
import { RootState, setAccount, setTabFocus } from "../redux-store";
import axios, { AxiosError, AxiosResponse } from "axios";
import { DOMAIN } from "@env";
import { navigationRef } from "../App";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";

const OfflineWarning = (props:StackNavigationProps):JSX.Element => {

    const skipAnimation = useAppSelector((state:RootState) => state.settings.skipAnimation);
    const dispatch = useAppDispatch();

    const connectionCheckAuthenticate = async () => {
        await axios.get(`${DOMAIN}/version`).then((response:AxiosResponse) => {
            ToastQueueManager.resetOfflineWarning();
            dispatch(setTabFocus(BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME));
            
            //@ts-ignore
            navigationRef.current?.navigate(ROUTE_NAMES.LOGIN_ROUTE_NAME, {tryJWTLogin: true});
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    return (
        <SafeAreaView style={styles.backgroundView}>
            <Image source={OFFLINE_LOGO} resizeMode={"contain"} style={{maxHeight: '90%', maxWidth: '90%'}}/>
            <Text style={styles.connectionMessage}>The stone rolled away, and so has your connection to our server</Text>
            <Raised_Button buttonStyle={styles.connectButton}
                text="I'm Connected"
                onPress={() => connectionCheckAuthenticate()}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    connectButton: {
        marginVertical: 35
    },
    connectionMessage: {
        ...theme.header,
        textAlign: "center",
        maxWidth: '90%',
        color: COLORS.white,
        //fontFamily: ""
    },
    backgroundView: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center"
    }
})

export default OfflineWarning;