import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { PrayerRequestCommentListItem, PrayerRequestListItem, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import theme, { COLORS, FONT_SIZES } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PrayerRequestTagEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import PrayerRequestEditForm from './PrayerRequestEdit';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RequestorProfileImage } from '../1-Profile/profile-widgets';
import { ProfileImage, Outline_Button, Raised_Button } from '../widgets';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { PrayerRequestComment } from './prayer-request-widgets';
import { RequestorCircleImage } from '../2-Circles/circle-widgets';
import { PrayerRequestCommentCreate } from './PrayerRequestCommentCreate';
import { ProfileListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { CircleListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';

export interface PrayerRequestDisplayParamList extends AppStackParamList {
    PrayerRequestProps: PrayerRequestListItem,
    callback?:(() => void)
}
type PrayerRequestDisplayProps = NativeStackScreenProps<PrayerRequestDisplayParamList, typeof ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME>;

const PrayerRequestDisplay = ({navigation, route}:PrayerRequestDisplayProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const PRAYER_ICON = require('../../assets/prayer-icon-blue.png');
    
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
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
    const [sharedRecipientsModalVisible, setSharedRecipientsModalVisible] = useState(false);
    const [prayerRequestEditModalVisible, setPrayerRequestEditModalVisible] = useState(false);
    const [commentCreateModalVisible, setCommentCreateModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }   
    }

    const renderComments = ():JSX.Element[] => 
        (commentsData || []).map((comment:PrayerRequestCommentListItem, index:number) => 
            <PrayerRequestComment commentProp={comment} key={index} callback={(commentID:number) => {setCommentsData((commentsData || []).filter((commentItem:PrayerRequestCommentListItem) => commentItem.commentID !== commentID ))}} />
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
            textProps.push(<Text style={styles.tagsText} key={tag}>{tag}</Text>);
            textProps.push(<Text style={styles.tagsText} key={index}>{"|"}</Text>)
        })
        textProps.pop()

        return textProps;
    }

    const onPrayPress = async () => {
        if (!hasPrayed) {
            await axios.post(`${DOMAIN}/api/prayer-request/` + currPrayerRequestState?.prayerRequestID + '/like', {}, RequestAccountHeader).then((response) => {
                setPrayerCount(prayerCount+1);
                setHasPrayed(true);
            }).catch((error:AxiosError) => console.log(error));
        }
    }

    const setPrayerRequestState = (prayerRequestData:PrayerRequestResponseBody, prayerRequestListData:PrayerRequestListItem) => {
        setDataFetchComplete(false);
        const prayerRequestItem:PrayerRequestListItem = {
            prayerRequestID: prayerRequestData.prayerRequestID,
            requestorProfile: prayerRequestListData.requestorProfile,
            topic: prayerRequestData.topic,
            prayerCount: prayerRequestData.prayerCount || prayerRequestListData.prayerCount
        };

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
        }).catch((error:AxiosError) => console.log(error));
    }

    useEffect(() => {
        if (route.params.PrayerRequestProps !== undefined) {
            setAppPrayerRequestListItem(route.params.PrayerRequestProps)
            renderPrayerRequest(route.params.PrayerRequestProps);
        }
    }, [route.params])

    const _renderController = ():JSX.Element => {
        if (!dataFetchComplete || currPrayerRequestState == undefined) {
            return (
                <View style={styles.container}>
                    <Text style={styles.splashText}>Please Wait</Text>
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
                                <Text style={styles.requestorNameText}>{appPrayerRequestListItem.requestorProfile.displayName}</Text>
                            </View>
                        </View>
                        <View style={styles.topicView}>
                            <Text style={styles.prayerRequestTopicText}>{appPrayerRequestListItem.topic}</Text>
                        </View>
                        <View style={styles.prayerDescriptionView}>
                            <Text style={styles.prayerDescriptionText}>{currPrayerRequestState.description}</Text>
                        </View>
                        <View style={styles.prayerRequestMetricsView}>
                            {renderTags()}
                            <TouchableOpacity onPress={onPrayPress}>
                                <View style={styles.socialDataView}>
                                <Image source={PRAYER_ICON} style={{height: 15, width: 15}} />
                                    <Text style={styles.prayerCountText}>{prayerCount}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalTitleText}>Shares</Text>
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
                                callback={(prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem, deletePrayerRequest?:boolean) => {
                                    setPrayerRequestEditModalVisible(false);
                                    if (prayerRequestData !== undefined && prayerRequestListData !== undefined) setPrayerRequestState(prayerRequestData, prayerRequestListData);
                                    else if (deletePrayerRequest == true) {
                                        // remove prayer request from list page
                                        route.params.callback !== undefined && route.params.callback();
                                        navigation.pop();
                                    }
                                }}
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
                                callback={(commentListItem:PrayerRequestCommentListItem) => {setCommentsData([...commentsData || [], commentListItem]); setCommentCreateModalVisible(false)}}
                            />
                            </View>

                        </Modal>
                        {
                            (commentsData !== undefined && commentsData.length !== 0) && <Text style={styles.commentsTitle}>Comments</Text>
                        }
                        
                    </View>
                    {
                        (commentsData !== undefined && commentsData.length !== 0) && 
                            <ScrollView style={styles.commentsView}>
                                {renderComments()}
                            </ScrollView>
                    }
                    
                    <View style={styles.buttonActionView}>
                    {
                        // Only render the 'Add Comment' button when the person viewing the prayer request isn't the PR owner. Otherwise render the edit button
                        appPrayerRequestListItem.requestorProfile.userID !== userID ? 
                        <TouchableOpacity
                                onPress={() => setCommentCreateModalVisible(true)}
                            >
                                <View style={styles.commentButton}>
                                    <Text style={styles.commentButtonText}>+</Text>
                                </View>
                        </TouchableOpacity>

                        :

                        <TouchableOpacity
                                onPress={() => setPrayerRequestEditModalVisible(true)}
                            >
                                <View style={styles.commentButton}>
                                <Ionicons 
                                    name="pencil-outline"
                                    color={COLORS.white}
                                    size={30}
                                />
                                </View>
                        </TouchableOpacity>
                    }
                    </View>
                    <View style={styles.backButtonView}>
                        <TouchableOpacity
                            onPress={() => navigation.pop()}
                        >
                            <View style={styles.backButton}>
                            <Ionicons 
                                name="return-up-back-outline"
                                color={COLORS.white}
                                size={30}
                            />
                            </View>
                        </TouchableOpacity>
                    </View>
                    
                </View>    
            )
        }
    }

    return (
        <View style={styles.container}>
            {_renderController()}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.black,
        //alignItems: "center",
        flex: 1
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
        //position: "absolute",
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
        backgroundColor: COLORS.primary,
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
        //position: "absolute",
        justifyContent: "center",
        //alignContent: "center",
        alignItems: "center",
        //bottom: 1,
        //right: 1,
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
    backButton: {
        //position: "absolute",
        justifyContent: "center",
        //alignContent: "center",
        alignItems: "center",
        //bottom: 1,
        //right: 1,
        height: 55,
        width: 55,
        //backgroundColor: COLORS.accent,
        borderRadius: 15,
    },
    backButtonView: {
        position: "absolute",
        top: 1,
        left: 1
    },
    buttonActionView: {
        position: "absolute",
        bottom: 25,
        right: 10
    },
    commentCreateView: {
        height: '50%',
        marginTop: 'auto',
    }
})
export default PrayerRequestDisplay;