import { DOMAIN } from '@env';
import axios from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { CircleTouchable, Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import { CircleListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { CIRCLE_DISPLAY_ROUTE_NAME, CIRCLE_SEARCH_ROUTE_NAME } from '../TypesAndInterfaces/custom-types';

export const CircleList = ({navigation, route}:StackNavigationProps):JSX.Element => {
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const userCircles = userProfile.circleList;

    const [circleModals, setCircleModals] = useState([] as CircleListItem[])

    const renderCircleModals = ():JSX.Element[] => {
        var circles:JSX.Element[] = [];
        circleModals.forEach((circleProps:CircleListItem, index) => {
            circles.push(
                <CircleTouchable
                    key={index}
                    circleProps={circleProps}
                    onPress={() => navigation.navigate(CIRCLE_DISPLAY_ROUTE_NAME, {
                        CircleProps: circleProps
                    })}
                />
            )
        })
        return circles;
    }

    useEffect(() => {
        if(userCircles !== undefined) {
            setCircleModals(userCircles as CircleListItem[])
        }
        else {
            navigation.navigate(CIRCLE_SEARCH_ROUTE_NAME);
        }
        
    }, [userCircles])

    return (
        <View style={styles.modalView}>
            <Text style={styles.modalHeaderText}>Circles</Text>
            <ScrollView contentContainerStyle={styles.circleSelectScroller}>
                {renderCircleModals()}
            </ScrollView>
            <Raised_Button buttonStyle={styles.statusButton}
                text={"Browse Circles"}
                onPress={() => navigation.navigate(CIRCLE_SEARCH_ROUTE_NAME)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    modalView: {
        ...theme.background_view,
        flex: 1,
        justifyContent: "flex-start"
    },
    circleSelectScroller: {
        height: 650
    },
    modalHeaderText: {
        ...theme.title,
        color: COLORS.white,
        fontSize: 32,
        margin: 25

    },
    statusButton: {
        height: 50,
        lineHeight: 25,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        //marginTop: 30,
    },
})