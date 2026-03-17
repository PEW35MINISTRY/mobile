import { TouchableOpacity, View, Image, SafeAreaView } from "react-native"
import React, { useEffect, useRef, useState } from 'react';
//@ts-ignore - the file exists
import PEW_35_ANIMATED_LOGO from '../../assets/Mobile-Persist-600px-GIF.gif';
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { StackActions } from '@react-navigation/native';
import { useAppDispatch } from "../TypesAndInterfaces/hooks";
import { initializeGlobalSettingsState } from "../redux-store";

const AnimatedLogo = (props:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const [destinationRoute, setDestinationRoute] = useState<ROUTE_NAMES | undefined>(undefined);
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | undefined>();

    useEffect(() => {
        // async functions cannot be called directly in useEffect
        (async () => {
            // check if the default setting state is set

            const hasReadIntroduction = await dispatch(initializeGlobalSettingsState);

            if (hasReadIntroduction) 
                setDestinationRoute(ROUTE_NAMES.LOGIN_ROUTE_NAME);
            else 
                setDestinationRoute(ROUTE_NAMES.INTRODUCTION_FLOW_ROUTE_NAME);
        })();

        const timerID = setTimeout(() => destinationRoute && props.navigation.dispatch(StackActions.replace(destinationRoute)), 7000)
        setTimeoutID(timerID);
    }, [])

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
            <TouchableOpacity
                onPress={() => {clearTimeout(timeoutID); destinationRoute && props.navigation.dispatch(StackActions.replace(destinationRoute))}} // cancel the timeout and navigate
                style={{justifyContent: "center", alignSelf: "center", alignContent: "center", top: 30}}
            >
                <Image source={PEW_35_ANIMATED_LOGO} resizeMode={"contain"} style={{maxHeight: '90%', maxWidth: '90%'}}/>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default AnimatedLogo;