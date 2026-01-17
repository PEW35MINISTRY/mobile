import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, setAnsweredPrayerRequestList } from '../redux-store';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS, FONT_SIZES } from '../theme';
import PrayerRequestCreate from './PrayerRequestCreateForm';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { PrayerRequestTouchable } from './prayer-request-widgets';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { Filler, FolderButton } from '../widgets';
import SearchList from '../Widgets/SearchList/SearchList';
import { SearchListKey, SearchListValue } from '../Widgets/SearchList/searchList-types';
import { ListItemTypesEnum, SearchType } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';

const PrayerRequestList = ({navigation, route}:StackNavigationProps):JSX.Element => {

    const jwt:string = useAppSelector((state: RootState) => state.account.jwt);
    const userOwnedPrayerRequests:PrayerRequestListItem[] = useAppSelector((state:RootState) => state.account.userProfile.ownedPrayerRequestList ?? []);

    const [receivingPrayerRequests, setReceivingPrayerRequests] = useState<PrayerRequestListItem[]>([]);
    const [prayerRequestCreateModalVisible, setPrayerRequestCreateModalVisible] = useState(false);


    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const GET_UserIsRecipientPrayerRequests = async () => {
        await axios.get(`${DOMAIN}/api/prayer-request/user-list`, RequestAccountHeader).then((response) => {
            if (response.data !== undefined) {
                const prayerRequestList:PrayerRequestListItem[] = response.data;
                setReceivingPrayerRequests(prayerRequestList);
            } 

        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    useEffect(() => {
        GET_UserIsRecipientPrayerRequests();
    }, []);

 return (
        <SafeAreaView style={styles.backgroundColor}>
            <SearchList
                key='prayer-request-main-page'
                name='prayer-request-main-page'
                defaultDisplayKey='Received'
                showMultiListFilter={true}
                footerItems={[<Filler />]}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Received', searchType: SearchType.NONE }),
                            receivingPrayerRequests.map((prayerRequest) => new SearchListValue({displayType: ListItemTypesEnum.PRAYER_REQUEST, displayItem: prayerRequest, onPress: () => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, { PrayerRequestProps: prayerRequest })} ))
                        ],
                        [
                            new SearchListKey({displayTitle:'Owned', searchType: SearchType.NONE }),
                            userOwnedPrayerRequests.map((prayerRequest) => new SearchListValue({displayType: ListItemTypesEnum.PRAYER_REQUEST, displayItem: prayerRequest, onPress: () => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, { PrayerRequestProps: prayerRequest }) }))
                        ],
                    ])}
            />
            <Modal 
                visible={prayerRequestCreateModalVisible}
                onRequestClose={() => setPrayerRequestCreateModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <PrayerRequestCreate callback={() => {setPrayerRequestCreateModalVisible(false) }}/>
            </Modal>
            <View style={styles.prayerRequestCreateButton}>
                <TouchableOpacity
                        onPress={() => setPrayerRequestCreateModalVisible(true)}
                    >
                        <Text allowFontScaling={false} style={styles.prayerRequestCreateButtonText}>+</Text>

                </TouchableOpacity>
                    </View>
        <FolderButton callback={() => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_ANSWERED_ROUTE_NAME)} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
        </SafeAreaView>
       
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.black,
        alignItems: "center",
        flex: 1,
    },
    backgroundColor: {
        backgroundColor: COLORS.black,
        flex: 1,
    },
    viewModeView: {
        flexDirection: "row",
        top: 15,
        marginBottom: 25
    },
    answeredPrayerRequestDividerText: {
        ...theme.header,
        marginTop: 10,
        marginBottom: 2,
        textAlign: "center",
    },
    viewModeTextSelected: {
        ...theme.title,
        textAlign: "center",
        marginHorizontal: 10
    },
    viewModeTextNotSelected: {
        ...theme.title,
        textAlign: "center",
        marginHorizontal: 10,
        color: COLORS.grayDark
    },
    prayerRequestList: {
        flex: 1
    },
    prayerRequestCreateButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        height: 55,
        width: 55,
        backgroundColor: COLORS.accent,
        borderRadius: 15,
    },
    prayerRequestCreateButtonText: {
        ...theme.text,
        textAlign: "center",
        fontSize: FONT_SIZES.XL
    },
    // use absolute so that the toggle buttons don't go off-center
    answeredView: {
        position: "absolute",
        right: 20,
        top: 18
    },
    answeredButton: {
        height: 30,
        width: 30,
        borderRadius: 5,
        backgroundColor: COLORS.accent,
        color: COLORS.accent
    }
})

export default PrayerRequestList;