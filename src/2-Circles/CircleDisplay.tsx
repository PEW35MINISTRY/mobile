import { DOMAIN } from '@env';
import axios, {AxiosResponse, AxiosError} from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, AppState, SafeAreaView, Platform } from 'react-native';
import { CircleAnnouncementListItem, CircleEventListItem, CircleListItem, CircleResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS, FONTS, FONT_SIZES } from '../theme';

import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { addMemberCircle, addRequestedCircle, removeInviteCircle, removeMemberCircle, removeRequestedCircle, RootState } from '../redux-store';
import { CircleStatusEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { EventTouchable, RequestorCircleImage, AnnouncementTouchable } from './circle-widgets';
import { PrayerRequestTouchable } from '../3-Prayer-Request/prayer-request-widgets';
import { RequestorProfileImage } from '../1-Profile/profile-widgets';
import { BackButton, Confirmation, Raised_Button, XButton } from '../widgets';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

export interface CircleDisplayParamList {
    CircleProps: CircleListItem
}

type CircleDisplayProps = NativeStackScreenProps<AppStackParamList, typeof ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME>;

export const CircleDisplay = ({navigation, route}:CircleDisplayProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    
    // headers for making axios requests
    const RequestAccountHeader = {
      headers: {
        "jwt": jwt, 
        "userID": userID,
      }
    }

    const [leaveCircleModalVisible, setLeaveCircleModalVisible] = useState(false) // show circle leave warning
    const [circleInfoModalVisible, setCircleInfoModalVisible] = useState(false); // show circle leader, circle name, and circle settings
    const [currCircleState, setCurrCircleState] = useState<CircleResponse | undefined>(undefined); // holds all current circle data
    const [appCircleListItem, setAppCircleListItem] = useState<CircleListItem>({circleID: -1, name: '', image: ''});
    const [announcementsData, setAnnouncementsData] = useState<CircleAnnouncementListItem[]>([]);
    const [prayerRequestsData, setPrayerRequestsData] = useState<PrayerRequestListItem[]>([]);
    const [eventsData, setEventsData] = useState<CircleEventListItem[]>([]);
    const [eventsVisible, setEventsVisible] = useState<boolean>(true);
    const [announcementsVisible, setAnnouncementsVisible] = useState<boolean>(true);
    const [dataFetchComplete, setDataFetchComplete] = useState(false); // toggles wait screen 

    const renderEvents = ():JSX.Element[] =>
        eventsVisible ? (eventsData || []).map((event:CircleEventListItem, index:number) => 
            <EventTouchable
                key={index}
                circleEvent={event}
                onPress={() => null}
            />
        ) : [];

    const renderAnnouncements = ():JSX.Element[] => 
        announcementsVisible ? (announcementsData || []).map((announcement:CircleAnnouncementListItem, index:number) => 
            <AnnouncementTouchable
                key={index}
                announcement={announcement}
                style={styles.announcementItem}
            />
        ) : [];

    const renderPrayerRequests = ():JSX.Element[] => 
        (prayerRequestsData || []).map((prayerRequest:PrayerRequestListItem, index:number) =>
            <PrayerRequestTouchable
                key={index}
                prayerRequestProp={prayerRequest}
                onPress={() => navigation.navigate(ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME, {
                    PrayerRequestProps: prayerRequest
                })}
            />
        );
    
    const acceptInvite = async () => {
        await axios.post(`${DOMAIN}/api/circle/` + currCircleState?.circleID + "/accept", {}, RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...appCircleListItem, status: CircleStatusEnum.MEMBER};
            setAppCircleListItem(newListItem);  //update local state
            dispatch(removeInviteCircle(newListItem.circleID));
            dispatch(addMemberCircle(newListItem));
            renderCircle(newListItem);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const requestCircleJoin = async () => {
        await axios.post(`${DOMAIN}/api/circle/` + currCircleState?.circleID + "/request", {}, RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...appCircleListItem, status: CircleStatusEnum.REQUEST};
            setAppCircleListItem(newListItem);  //update local state
            dispatch(addRequestedCircle(newListItem));
            setCurrCircleState(current => (current !== undefined) ? ({...current, requestorStatus: CircleStatusEnum.REQUEST}) : undefined);
            ToastQueueManager.show({message: "Membership request received"});    
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const leaveCircle = () => {
        axios.delete(`${DOMAIN}/api/circle/` + currCircleState?.circleID + "/leave", RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...appCircleListItem, status: CircleStatusEnum.NONE};
            dispatch(removeMemberCircle(newListItem.circleID));
            setLeaveCircleModalVisible(false);
            setCircleInfoModalVisible(false);
            setAppCircleListItem(newListItem);
            setCurrCircleState(current => (current !== undefined) ? ({...current, requestorStatus: CircleStatusEnum.NONE}) : undefined);  
            ToastQueueManager.show({message: `You are no longer a member of ${newListItem.name}`});    
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const renderCircle = async (circleProps:CircleListItem) => {
        
        // don't bother wasting resources when we are already rendering that circle
        if (circleProps.circleID == currCircleState?.circleID) return;

        setDataFetchComplete(false);
        
        await axios.get(`${DOMAIN}/api/circle/` + circleProps.circleID, RequestAccountHeader).then(response => {
            const circleData:CircleResponse = response.data;

            setCurrCircleState(circleData);
            setAppCircleListItem(circleProps);

            // locally, the app only knows that we requested membership. If the server sends a MEMBER status, update redux
            if (circleProps.status == CircleStatusEnum.REQUEST && circleData.requestorStatus == CircleStatusEnum.MEMBER) {
                dispatch(removeRequestedCircle(circleProps.circleID));
                dispatch(addMemberCircle(circleProps));
            }

            setEventsData(circleData.eventList || []);

            if (circleData.requestorStatus == CircleStatusEnum.MEMBER || circleData.requestorStatus == CircleStatusEnum.LEADER) {
                setAnnouncementsData(circleData.announcementList || []);
                setPrayerRequestsData(circleData.prayerRequestList || []);
            }

            setDataFetchComplete(true);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    useEffect(() => {
        if(route.params.CircleProps !== undefined) renderCircle(route.params.CircleProps);
        

    }, [route.params]);

    const _circleMemberController = () => {
        if (currCircleState?.leaderID === userID) return (
            <>
                {
                    announcementsData.length !== 0 && 
                    <View style={ announcementsVisible ? styles.announcementSectionVisible : styles.announcementSectionHidden}>
                        <TouchableOpacity onPress={() => setAnnouncementsVisible(!announcementsVisible)} >
                            <Text allowFontScaling={false} style={styles.annoucementText}>Announcements</Text>
                        </TouchableOpacity>
                            <ScrollView horizontal={true} contentContainerStyle={styles.announcementScroll}>
                                {renderAnnouncements()}
                            </ScrollView>
                    </View>
                }

                <View style={styles.PRSection}>
                    <Text allowFontScaling={false} style={styles.PRHeaderText}>Prayer Requests</Text>
                    <ScrollView style={styles.PRScroll}>
                        {renderPrayerRequests()}
                    </ScrollView>
                </View>
            </>
        );

        switch(currCircleState?.requestorStatus || CircleStatusEnum.NONE) {
            case CircleStatusEnum.REQUEST:
                // Pending Acceptance
                return (
                    <View>
                        <Text allowFontScaling={false} style={styles.statusText}>Pending Acceptance</Text>
                    </View>
                )
                break;
            case CircleStatusEnum.INVITE:
                // Accept Invite
                return (
                    <View>
                    <Raised_Button buttonStyle={styles.statusButton}
                        text={"Accept Invite"}
                        onPress={acceptInvite}
                    />
                </View>
                )

                break;
            case CircleStatusEnum.MEMBER || CircleStatusEnum.CONNECTED:
                return (
                    <>
                        {
                            announcementsData.length !== 0 && 

                            <View style={announcementsVisible ? styles.announcementSectionVisible : styles.announcementSectionHidden}>
                                <TouchableOpacity onPress={() => setAnnouncementsVisible(!announcementsVisible)}>
                                    <Text allowFontScaling={false} style={styles.annoucementText}>Announcements</Text>

                                </TouchableOpacity>
                                    <ScrollView horizontal={true} contentContainerStyle={styles.announcementScroll}>
                                        {renderAnnouncements()}
                                    </ScrollView>
                            </View>
                        }

                        <View style={styles.PRSection}>
                            <Text allowFontScaling={false} style={styles.PRHeaderText}>Prayer Requests</Text>
                            <ScrollView style={styles.PRScroll}>
                                {renderPrayerRequests()}
                            </ScrollView>
                        </View>
                    </>
                );
                break;
            default:
                return (
                    <View>
                        <Raised_Button buttonStyle={styles.statusButton}
                            text={"Request to Join"}
                            onPress={requestCircleJoin}
                        />
                    </View>
                )
                break;
        }
    }

    const _renderController = ():JSX.Element => {
        if (!dataFetchComplete || currCircleState === undefined) {
            return (
                <View style={styles.container}>
                    <Text allowFontScaling={false} style={styles.circleNameText}>Please Wait</Text>
                </View>
                
            )
        }
        else {
            // return circle page
            return (
                <View style={styles.container}>
                    <View style={styles.headerSection}>        
                        <RequestorCircleImage 
                            imageUri={currCircleState.image}
                            circleID={currCircleState.circleID}
                            style={styles.circleImageMainPage}
                        />
                    </View>
                    <View style={ eventsVisible ? styles.eventSectionVisible : styles.eventSectionHidden}>
                        <TouchableOpacity onPress={() => setEventsVisible(!eventsVisible)}>
                            <Text allowFontScaling={false} style={styles.PRHeaderText}>Events</Text>
                        </TouchableOpacity>
                        <ScrollView horizontal={true} contentContainerStyle={styles.eventScroll}>
                            {renderEvents()}
                        </ScrollView>
                    </View>
                    <Modal
                        visible={circleInfoModalVisible}
                        animationType='slide'
                        transparent={true}
                        onRequestClose={() => setCircleInfoModalVisible(!circleInfoModalVisible)}
                    >
                        <View style={styles.infoView}>
                            <View style={styles.headerSection}>
                                <RequestorCircleImage 
                                    imageUri={currCircleState.image}
                                    circleID={currCircleState.circleID}
                                    style={styles.circleImageInfoPage}
                                />
                                <View style={styles.circleNameHeader}> 
                                    <Text allowFontScaling={false} style={styles.circleNameText}>{currCircleState.name}</Text>
                                </View>
                               

                                <Text allowFontScaling={false} style={styles.circleLeaderText}>Circle Leader:</Text>

                                <RequestorProfileImage imageUri={currCircleState.leaderProfile.image} style={styles.leaderImage} />
                                
                                <View>
                                    <Text allowFontScaling={false} style={styles.leaderNameText}>{currCircleState.leaderProfile.displayName}</Text>
                                    <Text allowFontScaling={false} style={styles.orgName}>Citadel, Owatonna</Text>
                                </View>
                            </View>
                            {
                                // Fall-through case for circle leader
                                (currCircleState.requestorStatus == CircleStatusEnum.MEMBER || currCircleState.requestorStatus == CircleStatusEnum.CONNECTED) && 
                                <Raised_Button buttonStyle={styles.statusButton}
                                    text={"Leave Circle"}
                                    onPress={() => setLeaveCircleModalVisible(true)}
                                />
                            }
                            <BackButton callback={() => setCircleInfoModalVisible(false)} />
                        </View>
                        <Modal
                            visible={leaveCircleModalVisible}
                            animationType='slide'
                            transparent={true}
                            onRequestClose={() => setLeaveCircleModalVisible(false)}
                        >
                            <Confirmation 
                                callback={leaveCircle}
                                onCancel={() => setLeaveCircleModalVisible(false)}
                                promptText={currCircleState !== undefined && `leave ${currCircleState.name}` || 'leave this circle'}
                                buttonText='Leave'
                            />
                        </Modal>
                    
                    </Modal>
                    {_circleMemberController()}

                </View>
            )
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            
            {_renderController()} 
            
            <View style={styles.circleSettingsView}>
                <TouchableOpacity
                    onPress={() => setCircleInfoModalVisible(true)}    
                >
                    <View style={styles.circleSettingsButton}>
                    <Ionicons 
                        name="ellipsis-horizontal-outline"
                        color={COLORS.white}
                        size={30}
                    />
                    </View>
                </TouchableOpacity>
            </View>
            <BackButton navigation={navigation} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.black,
        flex: 1
    },
    leaderImage: {
        height: 90,
        width: 90,
        borderRadius: 100,
    },
    headerSection: {
        alignContent: "center",
        alignItems: "center",
        top: 15,
    },  
    headerRow: {
        flexDirection: "row"
    },
    circleNameText: {
        ...theme.title,
        fontSize: 32,
        textAlign: "center"
    },
    circleNameHeader: {
        maxWidth: '90%'
    },
    circleLeaderText: {
        ...theme.title,
        color: COLORS.white,
        fontSize: 22,
        margin: 5
    },
    circleSelectScroller: {
        height: 650
    },
    leaderNameText: {
        ...theme.primary,
        color: COLORS.white,
        fontSize: 18,
        textAlign: "center",
        margin:2
    },
    queryText: {
        backgroundColor: COLORS.grayDark
    },
    headerColumn: {
        flexDirection: "column",
        justifyContent: "center",
    },  
    // announcements will be fixed height, as they slide horizontally
    announcementSectionVisible: {
        height: 140,
        marginBottom: 10,
    },
    announcementSectionHidden: {
        height: 40,
        //marginTop: 20
    },
    announcementScroll: {
        height: 130
    },
    announcementItem: {
        width: 140,
        height: 60,
        marginVertical: 0,
    },
    headerScroll: {
        flex: 1,
    },
    eventSectionVisible: {
        height: 190,
        marginTop: 30,
        marginBottom: 10
    },
    eventSectionHidden: {
        height: 40,
        marginTop: 30
    },
    eventScroll: {
        alignContent: "center",
        justifyContent: "center"
    },
    PRSection: {
        flex: 1,
    },
    PRScroll: {
        flex: 1,
    },
    modalView: {
        backgroundColor: COLORS.black,
        justifyContent: "center",
        height: '50%',
        marginTop: 'auto',
    },
    modalHeaderText: {
        ...theme.title,
        color: COLORS.white,
        fontSize: 32,
        margin: 25,
        textAlign: "center"

    },
    circleImageMainPage: {
        height: 100,
        width: 100,
        borderRadius: 15,
        alignSelf: "center"
    },
    circleImageInfoPage: {
        height: 150,
        width: 150,
        borderRadius: 25,
        alignSelf: "center"
    },
    orgName: {
        ...theme.primary,
        fontSize: 12,
        textAlign: "center"
    },
    infoView: {
        ...theme.background_view,
        justifyContent: "flex-start"
    },
    annoucementText: {
        ...theme.primary,
        fontSize: 22,
        color: COLORS.white,
        marginBottom: 18,
        textAlign: "center"
    },
    PRHeaderText: {
        ...theme.primary,
        fontSize: 22,
        color: COLORS.white,
        textAlign: "center"
    },
    modalToggleTouchable: {
        backgroundColor: COLORS.grayDark,
        marginHorizontal: 30,
        borderRadius: 10,
        width: 130,
        height: 40,
    },
    activateModalText: {
        ...theme.primary,
        fontSize: 20,
        color: COLORS.white,
        textAlign: "center",
        lineHeight: 38
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
    statusText: {
        ...theme.title,
        textAlign: "center",
        marginTop: 20
    },
    bottomView: {
        bottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    circleSettingsButton: {
        justifyContent: "center",
        alignItems: "center",
        height: 55,
        width: 55,
        borderRadius: 15,
    },
    circleSettingsView: {
        position: "absolute",
        top: 40,
        right: 1
    },
    
})

