import { TouchableOpacity, View, Image } from "react-native"
import React, { useEffect, useRef, useState } from 'react';
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
//@ts-ignore - the file exists
import PEW_35_ANIMATED_LOGO from '../../../assets/Mobile-Persist-600px-GIF.gif';
import { ROUTE_NAMES } from "../../TypesAndInterfaces/routes";
import { StackNavigationProps } from "../../TypesAndInterfaces/custom-types";
import { StackActions } from '@react-navigation/native';

const AnimatedLogo = (props:StackNavigationProps):JSX.Element => {

    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>(setTimeout(() => props.navigation.dispatch(StackActions.replace(ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME)), 7000));

    return (
        <View style={{flex: 1, backgroundColor: "black"}}>
            <TouchableOpacity
                onPress={() => {clearTimeout(timeoutID); props.navigation.dispatch(StackActions.replace(ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME))}} // cancel the timeout and navigate
                style={{justifyContent: "center", alignSelf: "center", alignContent: "center", top: 30}}
            >
                <Image source={PEW_35_ANIMATED_LOGO} resizeMode={"contain"} style={{maxHeight: '90%', maxWidth: '90%'}}/>
            </TouchableOpacity>
        </View>
    )
}

export default AnimatedLogo;