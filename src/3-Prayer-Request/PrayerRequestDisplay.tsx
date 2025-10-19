import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { PrayerRequestCommentListItem, PrayerRequestListItem, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { addAnsweredPrayerRequest, addOwnedPrayerRequest, removeAnsweredPrayerRequest, removeExpiringPrayerRequest, removeOwnedPrayerRequest, RootState, setOwnedPrayerRequests } from '../redux-store';
import theme, { COLORS, FONT_SIZES } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PrayerRequestTagEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import PrayerRequestEditForm from './PrayerRequestEdit';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RequestorProfileImage } from '../1-Profile/profile-widgets';
import { BackButton, EditButton, Filler } from '../widgets';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { PrayerRequestComment } from './prayer-request-widgets';
import { RequestorCircleImage } from '../2-Circles/circle-widgets';
import { PrayerRequestCommentCreate } from './PrayerRequestCommentCreate';
import { ProfileListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { CircleListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

export interface PrayerRequestDisplayParamList{
    PrayerRequestProps: PrayerRequestListItem,
    navigateToEdit?: boolean
}
type PrayerRequestDisplayProps = NativeStackScreenProps<AppStackParamList, typeof ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME>;

const PrayerRequestDisplay = ({navigation, route}:PrayerRequestDisplayProps):JSX.Element => {
    const PRAYER_ICON = require('../../assets/prayer-icon-blue.png');
    
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const ownedPrayerRequests = useAppSelector((state:RootState) => state.account.userProfile.ownedPrayerRequestList);
    
    const [appPrayerRequestListItem, setAppPrayerRequestListItem] = useState<PrayerRequestListItem>({
        prayerRequestID: -1,
        requestorProfile: {
            userID: -1,
            firstName: "",
            displayName: ""
        }, 
        topic: "",
        prayerCount: -1
    });
    const [currPrayerRequestState, setCurrPrayerRequestState] = useState<PrayerRequestResponseBody | undefined>(undefined);
    const [dataFetchComplete, setDataFetchComplete] = useState(false); // toggles wait screen 
    const [commentsData, setCommentsData] = useState<PrayerRequestCommentListItem[] | undefined>([]);
    const [userRecipientData, setUserRecipientData] = useState<ProfileListItem[]>([]);
    const [circleRecipientData, setCircleRecipientData] = useState<CircleListItem[]>([]);
    const [tags, setTags] = useState<PrayerRequestTagEnum[]>([]);
    const [prayerCount, setPrayerCount] = useState(-1);
    const [hasPrayed, setHasPrayed] = useState(false); // TODO: change based on upcoming change where this is static in the PR body
    const [prayerRequestEditModalVisible, setPrayerRequestEditModalVisible] = useState(false);
    const [commentCreateModalVisible, setCommentCreateModalVisible] = useState(false);
    const [userHasOpenedEditModal, setUserHasOpenedEditModal] = useState(false); // prevent recursive loading of the edit modal

    const dispatch = useAppDispatch();

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }   
    }

    const renderComments = ():JSX.Element[] =>
        (commentsData || []).map((comment:PrayerRequestCommentListItem, index:number) => 
            <PrayerRequestComment commentProp={comment} key={index} callback={(commentID:number) => {setCommentsData((commentsData || []).filter((commentItem:PrayerRequestCommentListItem) => commentItem.commentID !== commentID )); ToastQueueManager.show({message: "Comment deleted"});
}} />
        );

    const renderUserRecipients = ():JSX.Element[] => 
        (userRecipientData || []).map((profile:ProfileListItem, index:number) => 
            <RequestorProfileImage userID={profile.userID} imageUri={profile.image} key={index} style={styles.snippetImage}/>
        );

    const renderCircleRecipients = ():JSX.Element[] => 
        (circleRecipientData || []).map((circle:CircleListItem, index:number) => 
            <RequestorCircleImage circleID={circle.circleID} imageUri={circle.image} key={index} style={styles.snippetImage}/>
        );

    const renderTags = ():JSX.Element[] => {
        const textProps:JSX.Element[] = [];
        (tags || []).forEach((tag:PrayerRequestTagEnum, index:number) => {
            textProps.push(<Text allowFontScaling={false} style={styles.tagsText} key={tag}>{tag}</Text>);
            textProps.push(<Text allowFontScaling={false} style={styles.tagsText} key={index}>{"|"}</Text>)
        })
        textProps.pop();

        return textProps;
    }

    const onPrayPress = async () => {
        if (!hasPrayed) {
            await axios.post(`${DOMAIN}/api/prayer-request/` + currPrayerRequestState?.prayerRequestID + '/like', {}, RequestAccountHeader).then((response) => {
                setPrayerCount(prayerCount+1);
                setHasPrayed(true);
            }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
        }
    }

    const setPrayerRequestState = (prayerRequestData:PrayerRequestResponseBody, prayerRequestListData:PrayerRequestListItem) => {
        setDataFetchComplete(false);
        const prayerRequestItem:PrayerRequestListItem = { ...prayerRequestListData, prayerCount: prayerRequestData.prayerCount };

        setCurrPrayerRequestState(prayerRequestData);
        setAppPrayerRequestListItem(prayerRequestItem);
        setCommentsData(prayerRequestData.commentList || [])
        setUserRecipientData(prayerRequestData.userRecipientList || []);
        setCircleRecipientData(prayerRequestData.circleRecipientList || []);
        setTags(prayerRequestData.tagList || []);
        setPrayerCount(prayerRequestData.prayerCount)

        setDataFetchComplete(true);
    }

    const renderPrayerRequest = async (prayerRequestProps:PrayerRequestListItem) => {
        if (prayerRequestProps.prayerRequestID == currPrayerRequestState?.prayerRequestID) return;

        setDataFetchComplete(false);
        await axios.get(`${DOMAIN}/api/prayer-request/` + prayerRequestProps.prayerRequestID, RequestAccountHeader).then(response => {
            const prayerRequestResponseData:PrayerRequestResponseBody = response.data;
            setPrayerRequestState(prayerRequestResponseData, prayerRequestProps)
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const prayerRequestEditCallback = (prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem, deletePrayerRequest?:boolean) => {
        setPrayerRequestEditModalVisible(false);

        const navigateToEdit = route.params.navigateToEdit !== undefined && route.params.navigateToEdit;

        if (prayerRequestData !== undefined && prayerRequestListData !== undefined) {
        
            // if a prayer request is on the expiring dashboard and the user modified the expiration date, remove it from the dashboard
            if (navigateToEdit && currPrayerRequestState !== undefined) {
                if (new Date(prayerRequestData.expirationDate) > new Date(currPrayerRequestState.expirationDate)) {
                    dispatch(removeExpiringPrayerRequest(appPrayerRequestListItem.prayerRequestID));

                    if (prayerRequestData?.isResolved === currPrayerRequestState.isResolved) dispatch(addOwnedPrayerRequest(prayerRequestListData))
                }
            }

            if (currPrayerRequestState !== undefined && prayerRequestData?.isResolved !== currPrayerRequestState.isResolved) {
                navigateToEdit && dispatch(removeExpiringPrayerRequest(appPrayerRequestListItem.prayerRequestID));
                if (prayerRequestData?.isResolved) { 
                    dispatch(removeOwnedPrayerRequest(prayerRequestListData.prayerRequestID)); 
                    dispatch(addAnsweredPrayerRequest(prayerRequestListData)) 
                }
                else if (prayerRequestData?.isResolved === false) { 
                    dispatch(addOwnedPrayerRequest(prayerRequestListData)); 
                    dispatch(removeAnsweredPrayerRequest(prayerRequestListData.prayerRequestID)) 
                }
            } else dispatch(setOwnedPrayerRequests((ownedPrayerRequests || []).map((prayerRequestItem:PrayerRequestListItem) => prayerRequestItem.prayerRequestID === prayerRequestListData.prayerRequestID ? prayerRequestListData : prayerRequestItem)));
            setPrayerRequestState(prayerRequestData, prayerRequestListData);
        }  
        else if (deletePrayerRequest === true) {
            dispatch(removeOwnedPrayerRequest(appPrayerRequestListItem.prayerRequestID));
            dispatch(removeExpiringPrayerRequest(appPrayerRequestListItem.prayerRequestID));
            dispatch(removeAnsweredPrayerRequest(appPrayerRequestListItem.prayerRequestID));
            navigation.goBack();
        }
    }

    useEffect(() => {
        if (route.params.PrayerRequestProps !== undefined) renderPrayerRequest(route.params.PrayerRequestProps);
        
    }, [route.params])

    useEffect(() => {
        if (route.params.navigateToEdit !== undefined && route.params.navigateToEdit && dataFetchComplete && userHasOpenedEditModal === false) {
            setPrayerRequestEditModalVisible(true);
            setUserHasOpenedEditModal(true)
        } 
    }, [dataFetchComplete])

    const _renderController = ():JSX.Element => {

        if (!dataFetchComplete || currPrayerRequestState == undefined) {
            return (
                <View style={styles.container}>
                    <Text allowFontScaling={false} style={styles.splashText}>Please Wait</Text>
                    <BackButton navigation={navigation} />
                </View>
                
            )
        }
        else {
            return (
                <View style={styles.container}>
                    <View style={styles.bodyContainer}>
                        <View style={styles.profileHeader}>
                            <RequestorProfileImage userID={appPrayerRequestListItem.requestorProfile.userID} imageUri={appPrayerRequestListItem.requestorProfile.image} style={{height: 35, width: 35}} />
                            <View style={styles.middleData}>
                                <Text allowFontScaling={false} style={styles.requestorNameText}>{appPrayerRequestListItem.requestorProfile.displayName}</Text>
                            </View>
                        </View>
                        <View style={styles.topicView}>
                            <Text allowFontScaling={false} style={styles.prayerRequestTopicText}>{appPrayerRequestListItem.topic}</Text>
                        </View>
                        <View style={styles.prayerDescriptionView}>
                            <Text allowFontScaling={false} style={styles.prayerDescriptionText}>{currPrayerRequestState.description}</Text>
                        </View>
                        <View style={styles.prayerRequestMetricsView}>
                            {renderTags()}
                            <TouchableOpacity onPress={onPrayPress}>
                                <View style={styles.socialDataView}>
                                <Image source={PRAYER_ICON} style={{height: 15, width: 15}} />
                                    <Text allowFontScaling={false} style={styles.prayerCountText}>{prayerCount}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text allowFontScaling={false} style={styles.modalTitleText}>Shares</Text>
                        <ScrollView horizontal={true} contentContainerStyle={styles.sharedCirclesScroll}>
                            {renderCircleRecipients()}
                            {renderUserRecipients()}
                        </ScrollView>
                        <Modal 
                            visible={prayerRequestEditModalVisible}
                            onRequestClose={() => setPrayerRequestEditModalVisible(false)}
                            animationType='slide'
                            transparent={true}
                        >
                            <PrayerRequestEditForm 
                                prayerRequestListData={appPrayerRequestListItem}
                                prayerRequestResponseData={currPrayerRequestState}
                                callback={prayerRequestEditCallback}
                            />
                        </Modal>
                        <Modal 
                            visible={commentCreateModalVisible}
                            onRequestClose={() => setCommentCreateModalVisible(false)}
                            animationType='slide'
                            transparent={true}
                        >
                            <View style={styles.commentCreateView}>
                            <PrayerRequestCommentCreate 
                                prayerRequestItem={appPrayerRequestListItem}
                                callback={(commentListItem?:PrayerRequestCommentListItem) => {if (commentListItem !== undefined ) setCommentsData ([...commentsData || [], commentListItem]); setCommentCreateModalVisible(false); ToastQueueManager.show({message: "Comment posted"});
                            }}
                            />
                            </View>

                        </Modal>
                        {
                            (commentsData !== undefined && commentsData.length !== 0) && <Text allowFontScaling={false} style={styles.commentsTitle}>Comments</Text>
                        }
                        
                    </View>
                    {
                        (commentsData !== undefined && commentsData.length !== 0) && 
                            <ScrollView style={styles.commentsView}>
                                {renderComments()}
                                <Filler fillerStyle={styles.fillerStyle}/>
                            </ScrollView>
                    }
                    
                    <View style={styles.buttonActionView}>
               
                        <TouchableOpacity
                                onPress={() => setCommentCreateModalVisible(true)}
                            >
                                <View style={styles.commentButton}>
                                    <Text allowFontScaling={false} style={styles.commentButtonText}>+</Text>
                                </View>
                        </TouchableOpacity>

                       
                    </View>
                    {appPrayerRequestListItem.requestorProfile.userID === userID && <EditButton callback={() => setPrayerRequestEditModalVisible(true)} /> }
                    <BackButton navigation={navigation} />
                    
                </View>    
            )
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {_renderController()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.black,
        flex: 1
    },
    fillerStyle: {
        height: 90
    },
    bodyContainer: {
        backgroundColor: COLORS.black,
        alignItems: "center"
    },
    modalContainer: {
        ...theme.background_view,
        justifyContent: "center",
        alignContent: "center"
    },
    topicView: {
        margin: 20,
    },
    splashText: {
        ...theme.title,
        fontSize: 32,
        textAlign: "center"
    },
    profileHeader: {
        flexDirection: "row",
        justifyContent: "flex-start",
        top: 20,
    },
    prayerRequestMetricsView: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        justifyContent: "center",
        //flex: 1
    },
    prayerDescriptionText: {
        ...theme.text,
        textAlign: "center",
        //marginTop: 40,
        flexWrap: "wrap",
        maxWidth: '95%',
    },
    prayerDescriptionView: {
        
    },
    commentsView: {

    },
    middleData: {
        flexDirection: "column",
        marginLeft: 10,
    },
    prayerRequestTopicText: {
        ...theme.header,
        fontSize: 34,
    },
    requestorNameText: {
        ...theme.text,
        fontSize: FONT_SIZES.M,
        color: COLORS.white,
        textAlign: "center",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginVertical: 6
    },
    tagsText: {
        ...theme.text,

        marginHorizontal: 2,
        fontSize: 12
    },
    prayerCountText: {
        ...theme.text,
        textAlign: "center",
        marginLeft: 2
    },
    socialDataView: {
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginHorizontal: 10,
        height: 26,
        paddingRight: 3,
        paddingLeft: 1
    },
    sharedCirclesScroll: {
        height: 50
    },
    recipientTitleText: {
        ...theme.title,
        color: COLORS.white,
        //fontWeight: "00"
        marginBottom: 5
    },
    modalTitleText: {
        ...theme.title,
        marginBottom: 5,
        marginTop: -5
    },
    snippetImage: {
        height: 50,
        width: 50,
        marginHorizontal: 5
    },
    commentsTitle: {
        ...theme.title,
        textAlign: "center",
        color: COLORS.white,
        marginTop: 15
    },
    commentButton: {
        justifyContent: "center",
        alignItems: "center",
        height: 55,
        width: 55,
        backgroundColor: COLORS.accent,
        borderRadius: 15,
    },
    commentButtonText: {
        ...theme.text,
        textAlign: "center",
        fontSize: FONT_SIZES.XL
    },
    buttonActionView: {
        position: "absolute",
        bottom: 25,
        right: 10
    },
    commentCreateView: {
        height: '65%',
        marginTop: 'auto',
    }
})
export default PrayerRequestDisplay;