import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, setAnsweredPrayerRequestList } from '../redux-store';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS, FONT_SIZES } from '../theme';
import PrayerRequestCreate from './PrayerRequestCreate';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { PrayerRequestTouchable } from './prayer-request-widgets';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { Filler } from '../widgets';

enum PrayerRequestListViewMode {
    RECIPIENT = "RECIPIENT",
    OWNER = "OWNER",
}

const PrayerRequestList = ({navigation, route}:StackNavigationProps):JSX.Element => {

    const jwt:string = useAppSelector((state: RootState) => state.account.jwt);
    const userID:number = useAppSelector((state: RootState) => state.account.userID);
    const userOwnedPrayerRequests:PrayerRequestListItem[] = useAppSelector((state:RootState) => state.account.userProfile.ownedPrayerRequestList ?? []);
    const answeredPrayerRequests:PrayerRequestListItem[] = useAppSelector((state:RootState) => state.account.answeredPrayerRequestList ?? []);

    const [receivingPrayerRequests, setReceivingPrayerRequests] = useState<PrayerRequestListItem[]>([]);
    const [viewMode, setViewMode] = useState<PrayerRequestListViewMode>(PrayerRequestListViewMode.RECIPIENT);
    const [prayerRequestCreateModalVisible, setPrayerRequestCreateModalVisible] = useState(false);

    const dispatch = useAppDispatch();

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
        GET_UserIsRecipientPrayerRequests();
    }, []);

    useEffect(() => {
        GET_ResolvedPrayerRequests();
    }, []);

    return (
        <SafeAreaView style={styles.backgroundColor}>
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
                        <Text allowFontScaling={false} style={(viewMode == PrayerRequestListViewMode.RECIPIENT && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Inbox</Text>
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.viewModeTextSelected}>|</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (viewMode !== PrayerRequestListViewMode.OWNER) {
                                setViewMode(PrayerRequestListViewMode.OWNER);
                            }
                        }}
                    >
                        <Text allowFontScaling={false} style={(viewMode == PrayerRequestListViewMode.OWNER && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Owned</Text>
                    </TouchableOpacity>

                    
                </View>
                <ScrollView style={styles.prayerRequestList}>
                    { viewMode == PrayerRequestListViewMode.OWNER ? 
                        <>
                            {renderPrayerRequests(userOwnedPrayerRequests)}
                            <Text style={styles.answeredPrayerRequestDividerText}>Inactive</Text>
                            {renderPrayerRequests(answeredPrayerRequests)}
                            <Filler fillerStyle={styles.fillerStyle}/>
                            
                        </> 
                        
                        : renderPrayerRequests(receivingPrayerRequests)}
                </ScrollView>
              
                <Modal 
                    visible={prayerRequestCreateModalVisible}
                    onRequestClose={() => setPrayerRequestCreateModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <PrayerRequestCreate callback={() => {setPrayerRequestCreateModalVisible(false); setViewMode(PrayerRequestListViewMode.OWNER); ToastQueueManager.show({message: "Sucessfully created Prayer Request"});
}}/>
                </Modal>
            </View>

            <View style={styles.prayerRequestCreateButton}>
                <TouchableOpacity
                        onPress={() => setPrayerRequestCreateModalVisible(true)}
                    >
                        <Text allowFontScaling={false} style={styles.prayerRequestCreateButtonText}>+</Text>

                </TouchableOpacity>
                    </View>

            

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
    fillerStyle: {
        height: 90,
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