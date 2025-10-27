import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView } from 'react-native';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { Filler, Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import { CircleListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { CircleTouchable } from './circle-widgets';
import SearchList from '../Widgets/SearchList/SearchList';
import { ListItemTypesEnum, SearchType } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';
import { SearchListKey, SearchListValue } from '../Widgets/SearchList/searchList-types';


export const CircleList = ({navigation}:StackNavigationProps):JSX.Element => {

    const userCircles = useAppSelector((state: RootState) => state.account.userProfile.circleList);
    const userInviteCircles = useAppSelector((state: RootState) => state.account.userProfile.circleInviteList);
    const userRequestCircles = useAppSelector((state: RootState) => state.account.userProfile.circleRequestList);

    const [circleModals, setCircleModals] = useState<CircleListItem[]>([...userCircles || [], ...userInviteCircles || [], ...userRequestCircles || []]);

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
        if(circleModals.length == 0) {
            navigation.navigate(ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME);
        }   
    }, []);

    // Update circle list and re-render if a user joins or leaves a circle
    useEffect(() => {
        setCircleModals([...userCircles || [], ...userInviteCircles || [], ...userRequestCircles || []]);
    }, [userCircles, userInviteCircles, userRequestCircles]);

  

    return (
        <View style={styles.backgroundColor}>
            <SearchList
                key='circle-list-page'
                name='circle-list-page'
                pageTitle="Circles"
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Circles', searchType: SearchType.NONE }),
                            circleModals.map((circle) => new SearchListValue({displayType: ListItemTypesEnum.CIRCLE, displayItem: circle, onPress: () => navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, { CircleProps: circle }) }))
                        ]
                    ])}
                />
           
            <Raised_Button buttonStyle={styles.statusButton}
                text={"Browse Circles"}
                onPress={() => navigation.navigate(ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    backgroundColor: {
        backgroundColor: COLORS.black,
        flex: 1,
    },
    statusButton: {
        height: 50,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
})
