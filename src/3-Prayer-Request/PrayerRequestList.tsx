import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS, FONT_SIZES } from '../theme';
import PrayerRequestCreate from './PrayerRequestCreate';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { PrayerRequestTouchable } from './prayer-request-widgets';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/toast-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

enum PrayerRequestListViewMode {
    RECIPIENT = "RECIPIENT",
    OWNER = "OWNER",
    ANSWERED = "ANSWERED"
}

const PrayerRequestList = ({navigation, route}:StackNavigationProps):JSX.Element => {
    const PRAYER_REQUEST_RESOLVED_ICON = require('../../assets/resolved-icon.png');

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userOwnedPrayerRequests = useAppSelector((state:RootState) => state.account.userProfile.ownedPrayerRequestList);

    const [ownedPrayerRequests, setOwnedPrayerRequests] = useState<PrayerRequestListItem[]>(userOwnedPrayerRequests || []);
    const [receivingPrayerRequests, setReceivingPrayerRequests] = useState<PrayerRequestListItem[]>([]);
    const [viewMode, setViewMode] = useState<PrayerRequestListViewMode>(PrayerRequestListViewMode.RECIPIENT);
    const [prayerRequestCreateModalVisible, setPrayerRequestCreateModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const renderPrayerRequests = (prayerRequests:PrayerRequestListItem[] | undefined):JSX.Element[] => 
        (prayerRequests || []).map((prayerRequest:PrayerRequestListItem, index:number) =>
            <PrayerRequestTouchable
                key={index+viewMode+prayerRequest.prayerRequestID}
                prayerRequestProp={prayerRequest}
                onPress={() => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, {
                    PrayerRequestProps: prayerRequest
                })}
            />
        );

    const GET_UserIsRecipientPrayerRequests = async () => {
        await axios.get(`${DOMAIN}/api/prayer-request/user-list`, RequestAccountHeader).then((response) => {
            if (response.data !== undefined) {
                const prayerRequestList:PrayerRequestListItem[] = response.data;
                setReceivingPrayerRequests(prayerRequestList);
            } 

        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const GET_ResolvedPrayerRequests = async () => {
        await axios.get(`${DOMAIN}/api/user/` + userID + `/prayer-request-resolved-list`, RequestAccountHeader).then((response) => {
            if (response.data !== undefined) {
                const prayerRequestList:PrayerRequestListItem[] = response.data;
                setReceivingPrayerRequests(prayerRequestList);
                setViewMode(PrayerRequestListViewMode.ANSWERED)
            }
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    useEffect(() => {
        GET_UserIsRecipientPrayerRequests();
    }, [])

    useEffect(() => {
        setOwnedPrayerRequests(userOwnedPrayerRequests || []);
    }, [userOwnedPrayerRequests]);

    return (
        <SafeAreaView style={styles.backgroundColor}>
            <View style={styles.container}>
                { (viewMode == PrayerRequestListViewMode.OWNER || viewMode == PrayerRequestListViewMode.ANSWERED) &&
                    <View style={styles.answeredView}>
                        <TouchableOpacity onPress={() => GET_ResolvedPrayerRequests()}>
                            <Image source={PRAYER_REQUEST_RESOLVED_ICON} style={{height: 30, width: 30}} />
                        </TouchableOpacity>
                    </View>
                }
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
                                setViewMode(PrayerRequestListViewMode.OWNER);
                            }
                        }}
                    >
                        <Text style={(viewMode == PrayerRequestListViewMode.OWNER && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Owned</Text>
                    </TouchableOpacity>

                    
                </View>
                <ScrollView style={styles.prayerRequestList}>
                    { viewMode == PrayerRequestListViewMode.OWNER ? renderPrayerRequests(ownedPrayerRequests) : renderPrayerRequests(receivingPrayerRequests)}
                </ScrollView>
              
                <Modal 
                    visible={prayerRequestCreateModalVisible}
                    onRequestClose={() => setPrayerRequestCreateModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <PrayerRequestCreate callback={(prayerRequest?:PrayerRequestListItem) => {if (prayerRequest !== undefined) setOwnedPrayerRequests([...ownedPrayerRequests, prayerRequest]); setPrayerRequestCreateModalVisible(false)}}/>
                </Modal>
            </View>

            <TouchableOpacity
                    onPress={() => setPrayerRequestCreateModalVisible(true)}
                >
                    <View style={styles.prayerRequestCreateButton}>
                        <Text style={styles.prayerRequestCreateButtonText}>+</Text>
                    </View>
            </TouchableOpacity>
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