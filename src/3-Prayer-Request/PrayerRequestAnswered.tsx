import { DOMAIN } from "@env";
import { RootState, setAnsweredPrayerRequestList } from "../redux-store";
import {  SafeAreaView, StyleSheet } from 'react-native';
import { PrayerRequestListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types";
import { StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import axios, { AxiosError } from "axios";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";
import React, { useEffect } from "react";
import SearchList from "../Widgets/SearchList/SearchList";
import { SearchListKey, SearchListValue } from "../Widgets/SearchList/searchList-types";
import { ListItemTypesEnum, SearchType } from "../TypesAndInterfaces/config-sync/input-config-sync/search-config";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { Filler } from "../widgets";
import { COLORS } from "../theme";

const PrayerRequestAnsweredPage =  ({navigation}:StackNavigationProps):JSX.Element => {

    const jwt:string = useAppSelector((state: RootState) => state.account.jwt);
    const answeredPrayerRequests:PrayerRequestListItem[] = useAppSelector((state:RootState) => state.account.answeredPrayerRequestList ?? []);
    const userID:number = useAppSelector((state: RootState) => state.account.userID);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const dispatch = useAppDispatch();

    const GET_ResolvedPrayerRequests = async () => {
            if (answeredPrayerRequests?.length === 0) {
                await axios.get(`${DOMAIN}/api/user/` + userID + `/prayer-request-resolved-list`, RequestAccountHeader).then((response) => {
                    if (response.data !== undefined) {
                        const prayerRequestList:PrayerRequestListItem[] = response.data;
                        if (prayerRequestList.length !== answeredPrayerRequests?.length) {
                            dispatch(setAnsweredPrayerRequestList(prayerRequestList));
                        }
                    }
                }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
            }
        }

    useEffect(() => {
        GET_ResolvedPrayerRequests();
    }, []);

    return (
        <SafeAreaView style={styles.backgroundColor}>
             <SearchList
                key='prayer-request-answered-page'
                name='prayer-request-answered-page'
                pageTitle="Answered Prayer Requests"
                backButtonNavigation={navigation}
                footerItems={[<Filler />]}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Answered', searchType: SearchType.NONE }),
                            [...answeredPrayerRequests].map((prayerRequest) => new SearchListValue({displayType: ListItemTypesEnum.PRAYER_REQUEST, displayItem: prayerRequest, onPress: () => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, { PrayerRequestProps: prayerRequest })} ))
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
    }
})

export default PrayerRequestAnsweredPage;