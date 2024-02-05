import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import { CircleListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { CircleTouchable } from './circle-widgets';


export const CircleList = ({navigation}:StackNavigationProps):JSX.Element => {
    const userCircles = useAppSelector((state: RootState) => state.account.userProfile.circleList);
    
    const [circleModals, setCircleModals] = useState<CircleListItem[]>([])

    const renderCircleModals = ():JSX.Element[] => 
        (circleModals || []).map((circleProps:CircleListItem, index:number) => 
            <CircleTouchable
                key={index}
                circleProps={circleProps}
                onPress={() => navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, {
                    CircleProps: circleProps
                })}
            />
        );

    useEffect(() => {
        if(userCircles !== undefined) {
            setCircleModals(userCircles);
        }
        else {
            navigation.navigate(ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME);
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
                onPress={() => navigation.navigate(ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME)}
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
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        //marginTop: 30,
    },
})
