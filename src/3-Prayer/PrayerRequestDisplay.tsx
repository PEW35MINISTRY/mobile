import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { PrayerRequestDisplayParamList, PrayerRequestDisplayProps } from '../TypesAndInterfaces/custom-types';
import { PrayerRequestCommentListItem, PrayerRequestListItem, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import theme, { COLORS, FONT_SIZES } from '../theme';
import { Outline_Button, PrayerRequestComment, ProfileImage, RequestorCircleImage, RequestorProfileImage } from '../widgets';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PrayerRequestTagEnum } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import PrayerRequestEditForm from './PrayerRequestEdit';

const PrayerRequestDisplay = ({navigation, route}:PrayerRequestDisplayProps):JSX.Element => {
    const dispatch = useAppDispatch();
    
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
    const [userRecipientData, setUserRecipientData] = useState<number[]>([]);
    const [circleRecipientData, setCircleRecipientData] = useState<number[]>([]);
    const [tags, setTags] = useState<PrayerRequestTagEnum[]>([]);
    const [prayerCount, setPrayerCount] = useState(-1);
    const [hasPrayed, setHasPrayed] = useState(false); // TODO: change based on upcoming change where this is static in the PR body
    const [sharedRecipientsModalVisible, setSharedRecipientsModalVisible] = useState(false);
    const [prayerRequestEditModalVisible, setPrayerRequestEditModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }   
    }

    const renderComments = ():JSX.Element[] => 
        (commentsData || []).map((comment:PrayerRequestCommentListItem, index:number) => 
            <PrayerRequestComment commentProp={comment} key={index}/>
        );
    
    const renderUserRecipients = ():JSX.Element[] => 
        (userRecipientData || []).map((id:number, index:number) => 
            <RequestorProfileImage userID={id} key={index} style={styles.snippetImage}/>
        );

    const renderCircleRecipients = ():JSX.Element[] => 
        (circleRecipientData || []).map((id:number, index:number) => 
            <RequestorCircleImage circleID={id} style={styles.snippetImage}/>
        );

    const renderTags = ():JSX.Element[] => 
        (tags || []).map((tag:PrayerRequestTagEnum, index:number) => 
            <Text style={styles.tagsText} key={index}>{tag}</Text>
        );

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
                    <View style={styles.profileHeader}>
                        <ProfileImage style={{height: 75, width: 75}}/>
                        <View style={styles.middleData}>
                            <Text style={styles.nameText}>{appPrayerRequestListItem.requestorProfile.displayName}</Text>
                            <Text style={styles.topicText}>{appPrayerRequestListItem.topic}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setPrayerRequestEditModalVisible(true)}
                        >
                            <Ionicons 
                                name="pencil-outline"
                                color={COLORS.white}
                                size={20}
                            />
                        </TouchableOpacity>

                    </View>
                    <View style={styles.prayerDescriptionView}>
                        <Text style={styles.prayerDescriptionText}>{currPrayerRequestState.description}</Text>
                    </View>
                    <View style={styles.prayerRequestMetricsView}>
                        {renderTags()}
                        <TouchableOpacity onPress={onPrayPress}>
                            <View style={styles.prayerCountView}>
                                <Text style={styles.prayerCountText}>{prayerCount} Prayed</Text>
                                <Text style={styles.prayerCountText}>+</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Outline_Button 
                        text={"Shares"}
                        onPress={() => setSharedRecipientsModalVisible(true)}
                    />
                    <Modal 
                        visible={sharedRecipientsModalVisible}
                        onRequestClose={() => setSharedRecipientsModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitleText}>Shares</Text>
                            <ScrollView horizontal={true} contentContainerStyle={styles.sharedCirclesScroll}>
                                {renderCircleRecipients()}
                            </ScrollView>
                            <ScrollView horizontal={true} contentContainerStyle={styles.sharedUserScroll}>
                                {renderUserRecipients()}
                            </ScrollView>
                        </View>
                    </Modal>
                    <Modal 
                        visible={prayerRequestEditModalVisible}
                        onRequestClose={() => setPrayerRequestEditModalVisible(false)}
                    >
                        <PrayerRequestEditForm 
                            prayerRequestListData={appPrayerRequestListItem}
                            prayerRequestResponseData={currPrayerRequestState}
                            callback={(prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem) => {
                                setPrayerRequestEditModalVisible(false);
                                if (prayerRequestData !== undefined && prayerRequestListData !== undefined) setPrayerRequestState(prayerRequestData, prayerRequestListData);
                            }}
                        />
                    </Modal>
                    <Text style={styles.commentsTitle}>Comments</Text>
                    <ScrollView style={styles.commentsView}>
                        {renderComments()}
                    </ScrollView>
                    <TouchableOpacity>
                        <View style={styles.commentButton}>
                            <Text style={styles.commentButtonText}>+</Text>
                        </View>
                    </TouchableOpacity>
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
        flex: 1,
        backgroundColor: COLORS.black,
        alignItems: "center"
    },
    modalContainer: {
        ...theme.background_view,

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
        flexDirection: "column",
        alignItems: "center",
        marginVertical: 15,
    },
    prayerDescriptionText: {
        ...theme.text,
        textAlign: "center",
        //marginTop: 40,
        flexWrap: "wrap",
        maxWidth: 300,
    },
    prayerDescriptionView: {
        marginTop: 40
    },
    commentsView: {
        flex: 1
    },
    middleData: {
        flexDirection: "column",
        marginLeft: 10,
    },
    nameText: {
        ...theme.header,
        fontSize: 30,
    },
    topicText: {
        ...theme.text,
        fontSize: FONT_SIZES.M,
        color: COLORS.white,
    },
    tagsText: {
        ...theme.text,
        fontStyle: "italic",
        marginHorizontal: 2,
        fontSize: 12
    },
    prayerCountText: {
        ...theme.text,
        textAlign: "center",

    },
    prayerCountView: {
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        //justifyContent: "center",
        flexDirection: "row",
        marginVertical: 10
    },
    recipientSharesView: {

    },
    sharedCirclesScroll: {
        height: 50
    },
    sharedUserScroll: {
        height: 50
    },
    shareButton: {

    },
    modalTitleText: {
        ...theme.header
    },
    snippetImage: {
        height: 50,
        width: 50
    },
    commentsTitle: {
        ...theme.title,
        textAlign: "center",
        color: COLORS.white,
        marginVertical: 10
    },
    commentButton: {
        position: "absolute",
        bottom: 10,
        right: 10,
        height: 55,
        width: 55,
        backgroundColor: COLORS.accent,
        borderRadius: 15,
    },
    commentButtonText: {
        ...theme.text,
        textAlign: "center",
        fontSize: FONT_SIZES.XL
    }
})
export default PrayerRequestDisplay;