import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS, FONT_SIZES } from '../theme';
import PrayerRequestCreate from './PrayerRequestCreate';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { PrayerRequestTouchable } from './prayer-request-widgets';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';

enum PrayerRequestListViewMode {
    RECIPIENT = "RECIPIENT",
    OWNER = "OWNER"
}

const PrayerRequestList = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const ownedPrayerRequests = useAppSelector((state: RootState) => state.account.userProfile.prayerRequestList);

    const [prayerRequestsData, setPrayerRequestsData] = useState<PrayerRequestListItem[]>([]);
    const [viewMode, setViewMode] = useState<PrayerRequestListViewMode>(PrayerRequestListViewMode.RECIPIENT);
    const [prayerRequestCreateModalVisible, setPrayerRequestCreateModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const renderPrayerRequests = ():JSX.Element[] => 
        (prayerRequestsData || []).map((prayerRequest:PrayerRequestListItem, index:number) =>
            <PrayerRequestTouchable
                key={index}
                prayerRequestProp={prayerRequest}
                onPress={() => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, {
                    params: {PrayerRequestProps: prayerRequest, callback: () => setPrayerRequestsData(prayerRequestsData.filter((prayerRequestListItem:PrayerRequestListItem) => prayerRequestListItem.prayerRequestID !== prayerRequest.prayerRequestID))},
                    screen: ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME
                })}
            />
        );

    const GET_UserIsRecipientPrayerRequests = async () => {
        await axios.get(`${DOMAIN}/api/prayer-request/user-list`, RequestAccountHeader).then((response) => {
            const prayerRequestList:PrayerRequestListItem[] = response.data;
            setPrayerRequestsData(prayerRequestList);
        }).catch((error:AxiosError) => console.log(error));
    }

    const GET_UserIsOwnerPrayerRequests = async () => {
        await axios.get(`${DOMAIN}/api/user/` + userID + `/prayer-request-list`, RequestAccountHeader).then((response) => {
            const prayerRequestList:PrayerRequestListItem[] = response.data;
            
            //TODO: update personal prayer requests in redux through some loop

        }).catch((error:AxiosError) => console.log(error));
    }

    useEffect(() => {
        GET_UserIsRecipientPrayerRequests();
        console.log("useEffect");
    }, [])

    return (
        <View style={styles.backgroundColor}>
            <View style={styles.container}>
                <View style={styles.viewModeView}>
                    <TouchableOpacity
                        onPress={() => {
                            if (viewMode !== PrayerRequestListViewMode.RECIPIENT) {
                                GET_UserIsRecipientPrayerRequests();
                                setViewMode(PrayerRequestListViewMode.RECIPIENT);
                            }
                        }}
                    >
                        <Text style={(viewMode == PrayerRequestListViewMode.RECIPIENT && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Inbox</Text>
                    </TouchableOpacity>
                    <Text style={styles.viewModeTextSelected}>|</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (viewMode !== PrayerRequestListViewMode.OWNER) {
                                setPrayerRequestsData(ownedPrayerRequests || []);
                                setViewMode(PrayerRequestListViewMode.OWNER);
                            }
                        }}
                    >
                        <Text style={(viewMode == PrayerRequestListViewMode.OWNER && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Owned</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.prayerRequestList}>
                    {renderPrayerRequests()}
                </ScrollView>
              
                <Modal 
                    visible={prayerRequestCreateModalVisible}
                    onRequestClose={() => setPrayerRequestCreateModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <PrayerRequestCreate callback={(newPrayerRequest) => { viewMode == PrayerRequestListViewMode.OWNER && setPrayerRequestsData([...prayerRequestsData, newPrayerRequest]); setPrayerRequestCreateModalVisible(false)}}/>
                </Modal>
            </View>
            <TouchableOpacity
                    onPress={() => setPrayerRequestCreateModalVisible(true)}
                >
                    <View style={styles.prayerRequestCreateButton}>
                        <Text style={styles.prayerRequestCreateButtonText}>+</Text>
                    </View>
            </TouchableOpacity>
        </View>
       
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
        //flex: 1,
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
    }
})

export default PrayerRequestList;