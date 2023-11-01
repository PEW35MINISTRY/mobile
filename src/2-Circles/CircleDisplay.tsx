import { DOMAIN } from '@env';
import axios, {AxiosResponse, AxiosError} from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { CircleAnnouncementListItem, CircleEventListItem, CircleListItem, CircleResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { TabNavigationProps, CircleState, StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import theme, { COLORS, FONTS, FONT_SIZES } from '../theme';

import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { CircleStatusEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, addCircle, removeCircle } from '../redux-store';
import { AnnouncementTouchable, CircleTouchable, EventTouchable, Input_Field, PrayerRequestTouchable, Raised_Button } from '../widgets';

// TODO: Make circle lookup page AS modal
// Also think about a dynamic lookup system for associating circles, users, prayer requests, etc

// Look into useLayoutEffect

const CircleDisplay = ({navigation, route}:StackNavigationProps, status: number):JSX.Element => {
    const dispatch = useAppDispatch();
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userCircles = useAppSelector((state:RootState) => state.account.userProfile.circleList);
    
    const routeProps = route.params;
    const circleProps = routeProps.CircleProps as unknown as CircleListItem;

    const RequestAccountHeader = {
      headers: {
        "jwt": jwt, 
        "userID": userID,
      }
    }

    const defaultState = {
        circleData: {} as CircleResponse,
        circleDataRequest: {} as CircleListItem
    } as CircleState;

    var renderState = {
        ...defaultState
    }

    const [leaveCircleModalVisible, setLeaveCircleModalVisible] = useState(false) // show circle leave warning
    const [circleInfoModalVisible, setCircleInfoModalVisible] = useState(false); // show circle leader, circle name, and circle settings
    const [currCircleState, setCurrCircleState] = useState(defaultState); // holds all current circle data
    const [announcementsData, setAnnouncementsData] = useState([] as CircleAnnouncementListItem[]);
    const [prayerRequestsData, setPrayerRequestsData] = useState([] as PrayerRequestListItem[]);
    const [eventsData, setEventsData] = useState([] as CircleEventListItem[]);
    const [dataFetchComplete, setDataFetchComplete] = useState(false); // toggles wait screen 

    const renderEvents = ():JSX.Element[] => {
        var eventModals:JSX.Element[] = [];
        if (eventsData !== undefined) {
            eventsData.forEach((event:CircleEventListItem, index) => {
                eventModals.push(
                    <EventTouchable
                        key={index}
                        circleEvent={event}
                        onPress={() => console.log("Event callback")}
                    />
                )
            });
        }
        return eventModals;
    }

    const renderAnnouncements = ():JSX.Element[] => {
        var announcementModals:JSX.Element[] = [];
        if (announcementsData !== undefined) {
            announcementsData.forEach((announcement:CircleAnnouncementListItem, index) => {
                announcementModals.push(
                    <AnnouncementTouchable
                        key={index}
                        announcementProps={announcement}
                    />
                )
            })
        }
        return announcementModals;
    }

    const renderPrayerRequests = ():JSX.Element[] => {
        var prayerRequestModals:JSX.Element[] = [];
        if (prayerRequestsData !== undefined) {
            prayerRequestsData.forEach((prayerRequest:PrayerRequestListItem, index) => {
                prayerRequestModals.push(
                    <PrayerRequestTouchable
                        key={index}
                        prayerRequestProps={prayerRequest}
                    />
                )
            })
        }
        return prayerRequestModals;
    }

    const acceptInvite = async () => {
        await axios.post(`${DOMAIN}/api/circle/` + currCircleState.circleData.circleID + "/accept", {}, RequestAccountHeader).then(response => {
            renderState = {...currCircleState}
            renderState.circleDataRequest.status = CircleStatusEnum.MEMBER;
            dispatch(addCircle(renderState.circleDataRequest)); // update redux
            renderCircle(renderState.circleDataRequest);

        }).catch(err => console.log(err));
    }

    const requestCircleJoin = async () => {
        await axios.post(`${DOMAIN}/api/circle/` + currCircleState.circleData.circleID + "/request", {}, RequestAccountHeader).then(response => {
            renderState = {...currCircleState}
            renderState.circleData.requestorStatus = CircleStatusEnum.REQUEST;
            console.log(renderState);
            setCurrCircleState(renderState);
        }).catch(err => console.log(err))
    }

    const leaveCircle = async () => {
       
        await axios.delete(`${DOMAIN}/api/circle/` + currCircleState.circleData.circleID + "/leave", RequestAccountHeader).then(response => {
            renderState = {...currCircleState}
            renderState.circleData.requestorStatus = CircleStatusEnum.NON_MEMBER;
            dispatch(removeCircle(currCircleState.circleData.circleID))
            setLeaveCircleModalVisible(false);
            setCircleInfoModalVisible(false);
            setCurrCircleState(renderState);         
        }).catch(err => console.log(err))
    }

    const renderCircle = async (circleProps:CircleListItem) => {
        
        // don't bother wasting resources when we are already rendering that circle
        if (circleProps.circleID == currCircleState.circleData.circleID) return;

        setDataFetchComplete(false);
        //console.log(circleProps.circleID, RequestAccountHeader);
        
        await axios.get(`${DOMAIN}/api/circle/` + circleProps.circleID, RequestAccountHeader).then(response => {

            renderState.circleData = response.data as CircleResponse
            renderState.circleDataRequest = circleProps;

            setEventsData(renderState.circleData.eventList as unknown as CircleEventListItem[]);
            setAnnouncementsData(renderState.circleData.announcementList as unknown as CircleAnnouncementListItem[]);
            setPrayerRequestsData(renderState.circleData.prayerRequestList as unknown as PrayerRequestListItem[]);
            
            // TODO: temporary, replace this monstrosity with a global hash table with circle ids to determine if public circle route has already been called; then add CircleListItem to redux
            // this is here because when an admin approves the request to join the circle, the app has no way of telling when this occurs, and thus the circle is not added to redux
            var found = false;
            userCircles?.forEach((circleProp:CircleListItem) => {
                if (circleProp.circleID == renderState.circleData.circleID) found = true;
            })
            if (!found) dispatch(addCircle(currCircleState.circleDataRequest));

            setCurrCircleState(renderState);
            setDataFetchComplete(true);
        }).catch(async (reason:AxiosError) => {

            // if the failure reason was 401 'unauthorized', use public circle route instead
            if (reason.response!.status === 401) {
                await axios.get(`${DOMAIN}/api/circle/` + circleProps.circleID + "/public", RequestAccountHeader).then(response => {
        
                    renderState.circleData = response.data as CircleResponse
                    renderState.circleDataRequest = circleProps;
        
                    setEventsData(renderState.circleData.eventList as unknown as CircleEventListItem[]);
                    
                    setCurrCircleState(renderState);
                    setDataFetchComplete(true);
                })
            }
            else console.error(reason);
        })
    
    }

    useEffect(() => {
        renderCircle(circleProps)  

    }, [circleProps]);

    const _circleMemberController = () => {
        switch(currCircleState.circleData.requestorStatus) {
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
                        <View style={styles.announcementSection}>
                            <Text style={styles.annoucementText}>Announcements</Text>
                            <ScrollView horizontal={true} contentContainerStyle={styles.announcementScroll}>
                                {renderAnnouncements()}
                            </ScrollView>
                        </View>
                        <View style={styles.PRSection}>
                            <Text style={styles.PRHeaderText}>Prayer Requests</Text>
                            <ScrollView style={styles.PRScroll}>
                                {renderPrayerRequests()}
                            </ScrollView>
                        </View>

                        <Modal
                            visible={leaveCircleModalVisible}
                            animationType='slide'
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
        if (!dataFetchComplete) {
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
                        {currCircleState.circleData.image !== "" && 
                            <Image source={{uri: currCircleState.circleData.image}} style={styles.circleImageMainPage}></Image> 
                            }     
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
                        onRequestClose={() => setCircleInfoModalVisible(!circleInfoModalVisible)}
                    >
                        <View style={styles.infoView}>
                            <View style={styles.headerSection}>
                                {currCircleState.circleData.image !== "" && 
                                    <Image source={{uri: currCircleState.circleData.image}} style={styles.circleImageInfoPage}></Image> 
                                }   
                                
                                <Text style={styles.circleNameText}>{currCircleState.circleData.name}</Text>

                                <Text style={styles.circleLeaderText}>Circle Leader:</Text>
                                {currCircleState.circleData.leaderProfile.image !== "" &&
                                    <Image source={{uri: currCircleState.circleData.leaderProfile.image}} style={styles.leaderImage} />
                                }
                                <View>
                                    <Text style={styles.leaderNameText}>{currCircleState.circleData.leaderProfile.displayName}</Text>
                                    <Text style={styles.orgName}>Citadel, Owatonna</Text>
                                </View>
                            </View>
                            {
                                (currCircleState.circleData.requestorStatus == CircleStatusEnum.MEMBER || currCircleState.circleData.requestorStatus == CircleStatusEnum.CONNECTED) && 
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
        flex: 1,
        
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