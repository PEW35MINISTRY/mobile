import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { PrayerRequestListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types";
import { PrayerRequestTagEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { CircleAnnouncementListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { RequestorProfileImage } from "../1-Profile/profile-widgets";

export const PrayerRequestTouchable = (props:{prayerRequestProp:PrayerRequestListItem, onPress:(() => void)}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    
    const [prayerCount, setPrayerCount] = useState(props.prayerRequestProp.prayerCount);
    const [hasPrayed, setHasPrayed] = useState(false); // Because the server doesn't have a dislike route, and there is no limit on how many times the same user likes, prevent the user from sending a like request when they have previously liked the PR

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const renderTags = ():JSX.Element[] => 
        (props.prayerRequestProp.tagList || []).map((tag:PrayerRequestTagEnum, index:number) => 
            <Text style={styles.tagsText} key={index}>{tag}</Text>
        );
    
    const onLikePress = async () => {
        if (!hasPrayed) {
            await axios.post(`${DOMAIN}/api/prayer-request/` + props.prayerRequestProp.prayerRequestID + '/like', {}, RequestAccountHeader).then((response) => {
                setPrayerCount(prayerCount+1);
                setHasPrayed(true);
            }).catch((error:AxiosError) => console.log(error));
        }
    }

    const styles = StyleSheet.create({
        container: {
            marginTop: 5,
            marginLeft: 8
        },
        opacity: {
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            width: 290,
            height: 80,
            marginTop: 10
        },
        nameText: {
            ...theme.header,
            fontSize: 20,
        },
        bodyText: {
            ...theme.text,
            fontSize: FONT_SIZES.S + 2,
            color: COLORS.white
        },
        prayerRequestDataTopView: {
            marginTop: 2,
            flexDirection: "row",
        },
        middleData: {
            flexDirection: "column",
            marginLeft: 10,
        },
        socialDataView: {
            backgroundColor: COLORS.primary,
            borderRadius: 5,
            //justifyContent: "center",
            position: "absolute",
            right: 2,
            //bottom: 2,
            //alignSelf: "center",
            flexDirection: "row",
            flex: 1
        },
        prayerCountText: {
            ...theme.text,
            color: COLORS.white,
            textAlign: "center",
            fontSize: 15
        },
        prayerCountIncreaseText: {
            ...theme.text,
            color: COLORS.white,
            textAlign: "center",
            fontSize: 12
        },
        tagsView: {
            backgroundColor: COLORS.grayDark,
            position: "absolute",
            bottom: 2,
            left: 2,
            flexDirection: "row",
           
        },
        tagsText: {
            ...theme.text,
            fontStyle: "italic",
            marginHorizontal: 2,
            fontSize: 12
        }

    });

    return (
        <View>
            <TouchableOpacity style={styles.opacity} onPress={props.onPress}>
                <View style={styles.container}>
                    <View style={styles.prayerRequestDataTopView}>
                        <RequestorProfileImage imageUri={props.prayerRequestProp.requestorProfile.image} userID={props.prayerRequestProp.requestorProfile.userID} style={{height: 50, width: 50}}/>
                        <View style={styles.middleData}>
                            <Text style={styles.nameText}>{props.prayerRequestProp.requestorProfile.displayName}</Text>
                            <Text style={styles.bodyText}>{props.prayerRequestProp.topic}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={onLikePress}>
                    <View style={styles.socialDataView}>
                        <Text style={styles.prayerCountText}>{prayerCount} Prayed</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.tagsView}>
                    {renderTags()}
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