import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, PRAYER_REQUEST_DISPLAY_ROUTE_NAME, StackNavigationProps, PrayerRequestViewMode } from '../TypesAndInterfaces/custom-types';
import { PrayerRequestTouchable } from '../widgets';
import theme, { COLORS, FONT_SIZES } from '../theme';
import PrayerRequestCreate from './PrayerRequestCreate';

const PrayerRequestList = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const ownedPrayerRequests = useAppSelector((state: RootState) => state.account.userProfile.prayerRequestList);

    const [prayerRequestsData, setPrayerRequestsData] = useState<PrayerRequestListItem[]>([]);
    const [viewMode, setViewMode] = useState<PrayerRequestViewMode>(PrayerRequestViewMode.RECIPIENT);
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
                onPress={() => navigation.navigate(PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, {
                    params: {PrayerRequestProps: prayerRequest},
                    screen: PRAYER_REQUEST_DISPLAY_ROUTE_NAME
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
            setPrayerRequestsData(prayerRequestList);
        }).catch((error:AxiosError) => console.log(error));
    }

    useEffect(() => {
        GET_UserIsRecipientPrayerRequests();
    }, [viewMode])

    return (
        <View style={styles.container}>
            <View style={styles.viewModeView}>
                <TouchableOpacity
                    onPress={() => {
                        if (viewMode !== PrayerRequestViewMode.RECIPIENT) {
                            GET_UserIsRecipientPrayerRequests();
                            setViewMode(PrayerRequestViewMode.RECIPIENT);
                        }
                    }}
                >
                    <Text style={(viewMode == PrayerRequestViewMode.RECIPIENT && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Inbox</Text>
                </TouchableOpacity>
                <Text style={styles.viewModeTextSelected}>|</Text>
                <TouchableOpacity
                    onPress={() => {
                        if (viewMode !== PrayerRequestViewMode.OWNER) {
                            setPrayerRequestsData(ownedPrayerRequests || []);
                            setViewMode(PrayerRequestViewMode.OWNER);
                        }
                    }}
                >
                    <Text style={(viewMode == PrayerRequestViewMode.OWNER && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Owned</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.prayerRequestList}>
                {renderPrayerRequests()}
            </ScrollView>
            <TouchableOpacity>
                <View style={styles.prayerRequestCreateButton}>
                    <Text style={styles.prayerRequestCreateButtonText}>PR</Text>
                </View>
            </TouchableOpacity>                
            <Modal 
                visible={prayerRequestCreateModalVisible}
                onRequestClose={() => setPrayerRequestCreateModalVisible(false)}
            >
                <PrayerRequestCreate callback={() => setPrayerRequestCreateModalVisible(false)}/>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
        alignItems: "center"
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
        color: COLORS.accent
    },
    prayerRequestList: {
        flex: 1
    },
    prayerRequestCreateButton: {
        position: "absolute",
        bottom: 10,
        right: 10,
        height: 55,
        width: 55,
        backgroundColor: COLORS.accent,
        alignItems: "baseline",
        borderRadius: 15,
    },
    prayerRequestCreateButtonText: {
        ...theme.text,
        textAlign: "center",
        fontSize: FONT_SIZES.XL
    }
})

export default PrayerRequestList