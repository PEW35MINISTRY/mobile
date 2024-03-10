import { DOMAIN } from '@env';
import axios, {AxiosResponse, AxiosError} from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { CircleAnnouncementListItem, CircleEventListItem, CircleListItem, CircleResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS, FONTS, FONT_SIZES } from '../theme';

import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, addCircle, removeCircle, updateCircle } from '../redux-store';
import { CircleList } from './CircleList';
import { CircleStatusEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { EventTouchable, RequestorCircleImage } from './circle-widgets';
import { AnnouncementTouchable, PrayerRequestTouchable } from '../3-Prayer-Request/prayer-request-widgets';
import { RequestorProfileImage } from '../1-Profile/profile-widgets';
import { Raised_Button } from '../widgets';

export interface CircleDisplayParamList extends AppStackParamList {
    CircleProps: CircleListItem
}

type CircleDisplayProps = NativeStackScreenProps<CircleDisplayParamList, typeof ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME>;

const CircleDisplay = ({navigation, route}:CircleDisplayProps):JSX.Element => {
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
    const [dataFetchComplete, setDataFetchComplete] = useState(false); // toggles wait screen 

    const renderEvents = ():JSX.Element[] =>
        (eventsData || []).map((event:CircleEventListItem, index:number) => 
            <EventTouchable
                key={index}
                circleEvent={event}
                onPress={() => console.log("Event callback")}
            />
        );

    const renderAnnouncements = ():JSX.Element[] => 
        (announcementsData || []).map((announcement:CircleAnnouncementListItem, index:number) => 
            <AnnouncementTouchable
                key={index}
                announcementProps={announcement}
            />
        );

    const renderPrayerRequests = ():JSX.Element[] => 
    
        (prayerRequestsData || []).map((prayerRequest:PrayerRequestListItem, index:number) =>
            <PrayerRequestTouchable
                key={index}
                prayerRequestProp={prayerRequest}
                onPress={() => console.log("PR")}
            />
        );
    
    const acceptInvite = async () => {
        await axios.post(`${DOMAIN}/api/circle/` + currCircleState?.circleID + "/accept", {}, RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...appCircleListItem, status: CircleStatusEnum.MEMBER};
            setAppCircleListItem(newListItem);  //update local state
            dispatch(addCircle(newListItem)); // update redux
            renderCircle(newListItem);
        }).catch(err => console.log(err));
    }

    const requestCircleJoin = async () => {
        await axios.post(`${DOMAIN}/api/circle/` + currCircleState?.circleID + "/request", {}, RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...appCircleListItem, status: CircleStatusEnum.REQUEST};
            setAppCircleListItem(newListItem);  //update local state
            dispatch(addCircle(newListItem));
            setCurrCircleState(current => (current !== undefined) ? ({...current, requestorStatus: CircleStatusEnum.REQUEST}) : undefined);
        }).catch(err => console.log(err))
    }

    const leaveCircle = async () => {
        await axios.delete(`${DOMAIN}/api/circle/` + currCircleState?.circleID + "/leave", RequestAccountHeader).then(response => {
            const newListItem:CircleListItem = {...appCircleListItem, status: CircleStatusEnum.NONE};
            dispatch(removeCircle(newListItem.circleID))
            setLeaveCircleModalVisible(false);
            setCircleInfoModalVisible(false);
            setAppCircleListItem(newListItem);
            setCurrCircleState(current => (current !== undefined) ? ({...current, requestorStatus: CircleStatusEnum.NONE}) : undefined);      
        }).catch(err => console.log(err))
    }

    const renderCircle = async (circleProps:CircleListItem) => {
        
        // don't bother wasting resources when we are already rendering that circle
        if (circleProps.circleID == currCircleState?.circleID) return;

        setDataFetchComplete(false);
        
        await axios.get(`${DOMAIN}/api/circle/` + circleProps.circleID, RequestAccountHeader).then(response => {

            const circleData:CircleResponse = response.data;
            const circleItem:CircleListItem = {
                circleID: circleData.circleID,
                name: circleData.name,
                image: circleData.image || '',
                status: circleData.requestorStatus
            };

            setCurrCircleState(circleData);
            setAppCircleListItem(circleItem);

            // locally, the app only knows that we requested membership. If the server sends a MEMBER status, update redux
            if (circleProps.status == CircleStatusEnum.REQUEST && circleData.requestorStatus == CircleStatusEnum.MEMBER) {
                dispatch(updateCircle(circleItem));
            }

            setEventsData(circleData.eventList || []);

            if (circleData.requestorStatus == CircleStatusEnum.MEMBER) {
                setAnnouncementsData(circleData.announcementList || []);
                setPrayerRequestsData(circleData.prayerRequestList || []);
            }

            setDataFetchComplete(true);
        }).catch((reason:AxiosError) =>  console.log(reason))
    }

    useEffect(() => {
        if(route.params.CircleProps !== undefined) { //Prevents rendering early
            setAppCircleListItem(route.params.CircleProps);
            renderCircle(route.params.CircleProps);
        }

    }, [route.params]);

    const _circleMemberController = () => {
        switch(currCircleState?.requestorStatus || CircleStatusEnum.NONE) {
            case CircleStatusEnum.REQUEST:
                // Pending Acceptance
                return (
                    <View>
                        <Text style={styles.statusText}>Pending Acceptance</Text>
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
                            <View style={styles.announcementSection}>
                                <Text style={styles.annoucementText}>Announcements</Text>
                                    <ScrollView horizontal={true} contentContainerStyle={styles.announcementScroll}>
                                        {renderAnnouncements()}
                                    </ScrollView>
                            </View>
                        }

                        <View style={styles.PRSection}>
                            <Text style={styles.PRHeaderText}>Prayer Requests</Text>
                            <ScrollView style={styles.PRScroll}>
                                {renderPrayerRequests()}
                            </ScrollView>
                        </View>

                        <Modal
                            visible={leaveCircleModalVisible}
                            animationType='slide'
                            transparent={true}
                            onRequestClose={() => setLeaveCircleModalVisible(!leaveCircleModalVisible)}
                        >
                             <View style={styles.modalView}>
                                <Text style={styles.modalHeaderText}>Are you sure you want to leave?</Text>
                                <Raised_Button buttonStyle={styles.statusButton}
                                    text={"Leave Circle"}
                                    onPress={leaveCircle}
                                />
                            </View>
                        </Modal>

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
                    <Text style={styles.circleNameText}>Please Wait</Text>
                </View>
                
            )
        }
        else {
            // return circle page
            return (
                <View style={styles.container}>
                    <View style={styles.headerSection}>
                    
                        <TouchableOpacity 
                            onPress={() => setCircleInfoModalVisible(true)}    
                        >
                            <RequestorCircleImage 
                                imageUri={currCircleState.image}
                                circleID={currCircleState.circleID}
                                style={styles.circleImageMainPage}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.eventSection}>
                        <Text style={styles.PRHeaderText}>Events</Text>
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
                                    <Text style={styles.circleNameText}>{currCircleState.name}</Text>
                                </View>
                               

                                <Text style={styles.circleLeaderText}>Circle Leader:</Text>

                                <RequestorProfileImage imageUri={currCircleState.leaderProfile.image} style={styles.leaderImage} />
                                
                                <View>
                                    <Text style={styles.leaderNameText}>{currCircleState.leaderProfile.displayName}</Text>
                                    <Text style={styles.orgName}>Citadel, Owatonna</Text>
                                </View>
                            </View>
                            {
                                (currCircleState.requestorStatus == CircleStatusEnum.MEMBER || currCircleState.requestorStatus == CircleStatusEnum.CONNECTED) && 
                                <Raised_Button buttonStyle={styles.statusButton}
                                    text={"Leave Circle"}
                                    onPress={() => setLeaveCircleModalVisible(!leaveCircleModalVisible)}
                                />
                            }
                        </View>
                    
                    </Modal>
                    {_circleMemberController()}

                </View>
            )
        }

    }

    return (
        <View style={styles.container}>
            
            {_renderController()}
            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.modalToggleTouchable}
                    onPress={() => navigation.pop()}
                >
                    <Text style={styles.activateModalText}>Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...theme.background_view,
        justifyContent: "center",
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
    announcementSection: {
        height: 140,
        marginTop: 20
    },
    announcementScroll: {
        height: 130
    },
    headerScroll: {
        flex: 1,
    },
    eventSection: {
        height: 190,
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
        ...theme.background_view,
        flex: 1,
        justifyContent: "flex-start"
    },
    modalHeaderText: {
        ...theme.title,
        color: COLORS.white,
        fontSize: 32,
        margin: 25

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
        marginBottom: 15,
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
        marginTop: 20
    },
    bottomView: {
        bottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    }
})

export default CircleDisplay;
