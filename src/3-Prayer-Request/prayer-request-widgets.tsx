import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { PrayerRequestCommentListItem, PrayerRequestListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types";
import { PrayerRequestTagEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { RequestorProfileImage } from "../1-Profile/profile-widgets";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";

export const PrayerRequestTouchable = (props:{prayerRequestProp:PrayerRequestListItem, onPress?:((id:number, item:PrayerRequestListItem) => void), callback?:(() => void)}):JSX.Element => {
    const PRAYER_ICON = require('../../assets/prayer-icon-blue.png');
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    
    const prayerRequestQueue = useAppSelector((state: RootState) => state.prayerRequestTime.prayerRequestQueue);

    const [prayerCount, setPrayerCount] = useState(props.prayerRequestProp.prayerCountRecipient);
    const [hasPrayed, setHasPrayed] = useState(false); // Because the server doesn't have a dislike route, and there is no limit on how many times the same user likes, prevent the user from sending a like request when they have previously liked the P
    const [isNew, setIsNew] = useState(props.prayerRequestProp.requestorProfile.userID !== userID && !prayerRequestQueue.some((item) => item.id === props.prayerRequestProp.prayerRequestID));
    const [isEdited, setIsEdited] = useState(props.prayerRequestProp.requestorProfile.userID !== userID && prayerRequestQueue.some((item) => { item.id === props.prayerRequestProp.prayerRequestID ? new Date(item.lastViewedTime) < new Date(props.prayerRequestProp.modifiedDT) : false }));

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const renderTags = ():JSX.Element[] => {
        const textProps:JSX.Element[] = [];
        (props.prayerRequestProp.tagList || []).forEach((tag:PrayerRequestTagEnum, index:number) => {
            textProps.push(<Text allowFontScaling={false} style={styles.tagsText} key={tag + "|" + index}>{tag}</Text>);
            textProps.push(<Text allowFontScaling={false} style={styles.tagsText} key={index + "|" + tag}>{" | "}</Text>);
        })
        textProps.pop();

        return textProps;
    }

    
    const onPrayedPress = async () => {
        if (!hasPrayed) {
            await axios.post(`${DOMAIN}/api/prayer-request/` + props.prayerRequestProp.prayerRequestID + '/like', {}, RequestAccountHeader).then((response) => {
                setPrayerCount(prayerCount+1);
                setHasPrayed(true);
            }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
        }
    }

    useEffect(() => {
        if (isNew)
            setIsNew(props.prayerRequestProp.requestorProfile.userID !== userID && !prayerRequestQueue.some((item) => item.id === props.prayerRequestProp.prayerRequestID));
        else if (isEdited)
            setIsEdited(props.prayerRequestProp.requestorProfile.userID !== userID && prayerRequestQueue.some((item) => { item.id === props.prayerRequestProp.prayerRequestID ? new Date(item.lastViewedTime) < new Date(props.prayerRequestProp.modifiedDT) : false }));
    }, [prayerRequestQueue])

    const styles = StyleSheet.create({
        prayerRequestListCard: {
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            width: '100%',
            maxHeight: 200,
            minHeight: 55,
            marginTop: 15,
        },
        topicText: {
            ...theme.header,
            fontSize: 28,
            maxWidth: '90%'
        },
        listItemFooter: {
            flexDirection: "row", 
            justifyContent: "space-between", 
            width: '100%'
        },
        prayerRequestDataColumn: {
            flexDirection: "row",
            marginLeft: 6,
        },
        prayerRequestDataRowLeft: {
            flexDirection: "column",
        },
        prayerRequestDataRowRight: {
            top: 1
        },
        socialDataView: {
            borderWidth: 1,
            borderColor: COLORS.accent,
            borderRadius: 5,
            alignItems: "center",
            flexDirection: "row",
            paddingRight: 3,
        },
        socialDataColumn: {
            flexDirection: "column"
        },
        prayerCountText: {
            ...theme.text,
            color: COLORS.white,
            textAlign: "center",
            fontSize: 15,
            marginLeft: 2
        },
        tagsView: {
            backgroundColor: COLORS.grayDark,
            paddingBottom: 5,
            flexDirection: "row",
        },
        tagsText: {
            ...theme.text,
            fontSize: 12
        },
        profileImageStyle : {
            position: 'absolute',
            height: 30, 
            width: 30, 
            top: 1,
            right: 1
        }
    });

    return (
        <View style={styles.prayerRequestListCard}>
            <TouchableOpacity onPress={() => props.onPress && props.onPress(props.prayerRequestProp.prayerRequestID, props.prayerRequestProp)}>
                <View style={styles.prayerRequestDataColumn}>
                    <View style={styles.prayerRequestDataRowLeft}>
                    { 
                        isNew &&  <>
                            <View style={{borderWidth: 1, borderRadius: 15, borderColor: COLORS.accent, width: 40, marginBottom: -2, marginTop: 6}}>
                                <Text allowFontScaling={false} style={{...theme.detailText, color: COLORS.accent, textAlign: 'center'}}>New</Text>
                            </View>
                        </>
                    }
                    { 
                        isEdited &&  <>
                            <View style={{borderWidth: 1, borderRadius: 15, borderColor: COLORS.white, width: 40, marginBottom: -2, marginTop: 6}}>
                                <Text allowFontScaling={false} style={{...theme.detailText, color: COLORS.white, textAlign: 'center'}}>Edited</Text>
                            </View>
                        </>
                    }
                    <RequestorProfileImage imageUri={props.prayerRequestProp.requestorProfile.image} userID={props.prayerRequestProp.requestorProfile.userID} style={styles.profileImageStyle }/>
                        <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode='tail' style={styles.topicText}>{props.prayerRequestProp.topic}</Text>
                        <View style={styles.listItemFooter}>
                            <View style={styles.tagsView}>
                                {renderTags()}
                            </View>
                            <View style={{flexDirection: "column"}}>
                                <TouchableOpacity onPress={onPrayedPress}>
                                    <View style={styles.socialDataView}>
                                        <Image source={PRAYER_ICON} style={{height: 15, width: 15}} />
                                        <Text allowFontScaling={false} style={styles.prayerCountText}>{prayerCount}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}


export const PrayerRequestComment = (props:{commentProp:PrayerRequestCommentListItem, callback:((commentID:number) => void), visible?:boolean}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userProfile.userID);
    const [isLiked, setIsLiked] = useState(props.commentProp.likedByRecipient);
    const [hasBeenLiked, setHasBeenLiked] = useState(false); // Because the server doesn't have a dislike route, and there is no limit on how many times the same user likes, prevent the user from sending a like request when they have previously liked the comment

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const onLikePress = async () => {
        if (isLiked) {
            setIsLiked(false);
        } else {
            // like
            if (!hasBeenLiked) {
                await axios.post(`${DOMAIN}/api/prayer-request/` + props.commentProp.prayerRequestID + '/comment/' + props.commentProp.commentID + '/like', {}, RequestAccountHeader).then((response) => {
                    setIsLiked(true);
                    setHasBeenLiked(true);
                }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
            }
            else {
                setIsLiked(true);
            }
           
        }
    }

    const onDeletePress = async () => {
        await axios.delete(`${DOMAIN}/api/prayer-request/` + props.commentProp.prayerRequestID + '/comment/' + props.commentProp.commentID, RequestAccountHeader).then((response) => {
            props.callback(props.commentProp.commentID);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const styles = StyleSheet.create({
        container: {
            justifyContent: "flex-start",
            left: 15,
            marginVertical: 6,
            color: props.visible ? 'purple' : undefined
        },
        nameText: {
            ...theme.header,
            fontSize: 12,
        },
        bodyText: {
            ...theme.text,
            fontSize: FONT_SIZES.S + 2,
            flex: 1,
            maxWidth: "85%"
        },
        prayerRequestDataTopView: {
            marginTop: 2,
            flexDirection: "row",
        },
        middleData: {
            flexDirection: "column",
            marginLeft: 10,
            flexGrow: 1
        },
        likeCountText: {
            ...theme.text,
            color: COLORS.white,
            textAlign: "center",
            fontSize: 15,
            marginHorizontal: 2
        },
        socialDataView: {
            borderWidth: 1,
            borderColor: COLORS.accent,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            left: 1,
            flexDirection: "row",
            padding: 3,
            alignSelf: "flex-start"
        },
        commentDataView: {
            justifyContent: "flex-start",
            marginTop: 5
        },
        verticalData: {
            flexDirection: "column",
            marginRight: 26,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: -50
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.prayerRequestDataTopView}>
                <RequestorProfileImage style={{height: 30, width: 30}} imageUri={props.commentProp.commenterProfile.image}/>
                <View style={styles.middleData}>
                    <Text allowFontScaling={false} style={styles.nameText}>{props.commentProp.commenterProfile.displayName}</Text>
                    <Text allowFontScaling={false} style={styles.bodyText}>{props.commentProp.message}</Text>
                </View>
                <View style={styles.verticalData}>
                    <View style={styles.commentDataView}>
                        <TouchableOpacity onPress={onLikePress}>
                            <View style={styles.socialDataView}>
                                <Ionicons 
                                    name="thumbs-up-outline"
                                    color={COLORS.white}
                                    size={15}
                                />
                                    <Text allowFontScaling={false} style={styles.likeCountText}>{isLiked}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    { props.commentProp.commenterProfile.userID == userID && 
                        <View style={styles.commentDataView}>
                            <TouchableOpacity onPress={onDeletePress}>
                                <View style={styles.socialDataView}>
                                    <Ionicons 
                                        name="trash-outline"
                                        color={COLORS.white}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                
            </View>
            
        </View>
        
    )
}