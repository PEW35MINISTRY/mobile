import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView } from 'react-native';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { Filler, Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import { CircleListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { addRequestedCircle, RootState } from '../redux-store';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { CircleTouchable } from './circle-widgets';
import SearchList from '../Widgets/SearchList/SearchList';
import { DisplayItemType, ListItemTypesEnum, SearchType } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';
import { SearchListKey, SearchListValue } from '../Widgets/SearchList/searchList-types';
import axios, { AxiosError } from 'axios';
import { DOMAIN } from '@env';
import { CircleStatusEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';


export const CircleList = ({navigation}:StackNavigationProps):JSX.Element => {

    const userCircles = useAppSelector((state: RootState) => state.account.userProfile.circleList);
    const userInviteCircles = useAppSelector((state: RootState) => state.account.userProfile.circleInviteList);
    const userRequestCircles = useAppSelector((state: RootState) => state.account.userProfile.circleRequestList);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const dispatch = useAppDispatch();
    
        
    // headers for making axios requests
    const RequestAccountHeader = {
        headers: {
        "jwt": jwt, 
        "userID": userID,
        }
    }

    const [circleModals, setCircleModals] = useState<CircleListItem[]>([...userCircles || [], ...userInviteCircles || [], ...userRequestCircles || []]);

    const requestCircleJoin = async (id:number, item:DisplayItemType) => {
        await axios.post(`${DOMAIN}/api/circle/` + id + "/request", {}, RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...item as CircleListItem, status: CircleStatusEnum.REQUEST};
            //@ts-ignore
            item.status = CircleStatusEnum.REQUEST
            dispatch(addRequestedCircle(newListItem));
            ToastQueueManager.show({message: "Membership request received"});    
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

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
        <SafeAreaView style={styles.backgroundColor}>
            <SearchList
                key='circle-list-page'
                name='circle-list-page'
                pageTitle="Circles"
                footerItems={[<Filler />]}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Circles', searchType: SearchType.CIRCLE, onSearchPress: (id, item) => navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, { CircleProps: item as CircleListItem }), onSearchPrimaryButtonCallback: requestCircleJoin, searchPrimaryButtonText: 'Join' }),
                            circleModals.map((circle) => new SearchListValue({displayType: ListItemTypesEnum.CIRCLE, displayItem: circle, onPress: () => navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, { CircleProps: circle }) }))
                        ]
                    ])}
                />
        </SafeAreaView>
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
