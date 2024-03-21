import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { PrayerRequestCommentListItem, PrayerRequestListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types";
import { PrayerRequestTagEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { CircleAnnouncementListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { RequestorProfileImage } from "../1-Profile/profile-widgets";
import Ionicons from "react-native-vector-icons/Ionicons";

export const PrayerRequestTouchable = (props:{prayerRequestProp:PrayerRequestListItem, onPress:(() => void), callback?:(() => void)}):JSX.Element => {
    const PRAYER_ICON = require('../../assets/prayer-icon-blue.png');
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    
    const [prayerCount, setPrayerCount] = useState(props.prayerRequestProp.prayerCount);
    const [hasPrayed, setHasPrayed] = useState(false); // Because the server doesn't have a dislike route, and there is no limit on how many times the same user likes, prevent the user from sending a like request when they have previously liked the PR

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }
//index+viewMode+prayerRequest.prayerRequestID
    const renderTags = ():JSX.Element[] => {
        const textProps:JSX.Element[] = [];
        (props.prayerRequestProp.tagList || []).forEach((tag:PrayerRequestTagEnum, index:number) => {
            textProps.push(<Text style={styles.tagsText} key={tag + "|" + index}>{tag}</Text>);
            textProps.push(<Text style={styles.tagsText} key={index + "|" + tag}>{"|"}</Text>);
        })
        textProps.pop();

        return textProps;
    }

    
    const onPrayedPress = async () => {
        if (!hasPrayed) {
            await axios.post(`${DOMAIN}/api/prayer-request/` + props.prayerRequestProp.prayerRequestID + '/like', {}, RequestAccountHeader).then((response) => {
                setPrayerCount(prayerCount+1);
                setHasPrayed(true);
            }).catch((error:AxiosError) => console.log(error));
        }
    }

    const styles = StyleSheet.create({
        prayerRequestListCard: {
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            minWidth: '90%',
            height: 55,
            marginTop: 15,
            //padding: 
        },
        topicText: {
            ...theme.header,
            fontSize: 28,
        },
        prayerRequestDataColumn: {
            flexDirection: "row",
            marginLeft: 6,
        },
        prayerRequestDataRowLeft: {
            flexDirection: "column",
            //justifyContent: "center"
        },
        prayerRequestDataRowRight: {
            flexDirection: "column",
            flex: 1,
            justifyContent: "flex-start",
            alignSelf: "center",
            alignContent: "center",
        },
        prayerRequestFlex: {
            flex: 1
        },
        socialDataView: {
            borderWidth: 1,
            borderColor: COLORS.accent,
            borderRadius: 5,
            alignItems: "center",
            flexDirection: "row",
            paddingRight: 3,
            marginVertical: 6
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
            //position: "absolute",
            bottom: 2,
            //left: 2,
            flexDirection: "row",
        },
        tagsText: {
            ...theme.text,
            marginHorizontal: 2,
            fontSize: 12
        },
        pfpStyle: {
            height: 22, 
            width: 22, 
            marginTop: 5
        }

    });

    return (
        <View style={styles.prayerRequestListCard}>
            <TouchableOpacity onPress={props.onPress}>
                <View style={styles.prayerRequestDataColumn}>
                    <View style={styles.prayerRequestDataRowLeft}>
                        <Text style={styles.topicText}>{props.prayerRequestProp.topic}</Text>
                        <View style={styles.tagsView}>
                            {renderTags()}
                        </View>
                    </View>
                    <View style={styles.prayerRequestFlex}></View>
                    <TouchableOpacity onPress={onPrayedPress}>
                        <View style={styles.prayerRequestDataRowRight}>
                            <RequestorProfileImage imageUri={props.prayerRequestProp.requestorProfile.image} userID={props.prayerRequestProp.requestorProfile.userID} style={styles.pfpStyle}/>
                            <View style={styles.socialDataView}>
                                <Image source={PRAYER_ICON} style={{height: 15, width: 15}} />
                                <Text style={styles.prayerCountText}>{prayerCount}</Text>
                            </View>
                        </View>
                     
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const AnnouncementTouchable = (props:{announcementProps: CircleAnnouncementListItem}):JSX.Element => {
    const styles = StyleSheet.create({
        container: {
            width: 140,
            height: 60,
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
        },
        bubbleStyle: {
            backgroundColor: COLORS.primary,
            width: 175,
            height: 80,
            borderRadius: 15,
            justifyContent: "center",
            alignContent: "center",
            marginHorizontal: 5
        },
        titleText: {
            ...theme.primary,
            color: COLORS.white,
            fontWeight: "700"
        },
        bodyText: {
            ...theme.text,
            fontSize: FONT_SIZES.S,
            
        }
    });

    return (
        <View>
            <TouchableOpacity style={styles.bubbleStyle}>
                <View style={styles.container}>
                    <Text style={styles.titleText}>{new Date(props.announcementProps.startDate as unknown as string).toDateString()}</Text>
                    <Text style={styles.bodyText}>{props.announcementProps.message}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const PrayerRequestComment = (props:{commentProp:PrayerRequestCommentListItem, callback:((commentID:number) => void)}):JSX.Element => {
    const PRAYER_ICON = require('../../assets/prayer-icon-blue.png');
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userProfile.userID);
    const [likeCount, setLikeCount] = useState(props.commentProp.likeCount);
    const [isLiked, setIsLiked] = useState(false);
    const [hasBeenLiked, setHasBeenLiked] = useState(false); // Because the server doesn't have a dislike route, and there is no limit on how many times the same user likes, prevent the user from sending a like request when they have previously liked the comment

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const onLikePress = async () => {
        if (isLiked) {
            setLikeCount(likeCount-1);
            setIsLiked(false);
        } else {
            // like
            if (!hasBeenLiked) {
                await axios.post(`${DOMAIN}/api/prayer-request/` + props.commentProp.prayerRequestID + '/comment/' + props.commentProp.commentID + '/like', {}, RequestAccountHeader).then((response) => {
                    setLikeCount(likeCount+1);
                    setIsLiked(true);
                    setHasBeenLiked(true);
                }).catch((error:AxiosError) => console.log(error));
            }
            else {
                setLikeCount(likeCount+1);
                setIsLiked(true);
            }
           
        }
    }

    const onDeletePress = async () => {
        await axios.delete(`${DOMAIN}/api/prayer-request/` + props.commentProp.prayerRequestID + '/comment/' + props.commentProp.commentID, RequestAccountHeader).then((response) => {
            props.callback(props.commentProp.commentID);
        }).catch((error:AxiosError) => console.log(error));
    }

    const styles = StyleSheet.create({
        container: {
            justifyContent: "flex-start",
            left: 15,
            marginVertical: 6
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
            //backgroundColor: COLORS.primary,
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
                    <Text style={styles.nameText}>{props.commentProp.commenterProfile.displayName}</Text>
                    <Text style={styles.bodyText}>{props.commentProp.message}</Text>
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
                                    <Text style={styles.likeCountText}>{likeCount}</Text>
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