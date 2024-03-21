import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Text, GestureResponderEvent, ImageSourcePropType, ImageStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { CircleListItem, CircleAnnouncementListItem, CircleEventListItem, CircleLeaderResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import { Outline_Button } from "../widgets";
import { RecipientFormCircleListItem, RecipientFormViewMode, RecipientStatusEnum } from "../Widgets/RecipientIDList/recipient-types";

export const RequestorCircleImage = (props:{style?:ImageStyle, imageUri?:string, circleID?:number}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const DEFAULT_CIRCLE_ICON = require("../../assets/circle-icon-blue.png");
    const [requestorImage, setRequestorImage] = useState<ImageSourcePropType>(DEFAULT_CIRCLE_ICON);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }
    const styles = StyleSheet.create({
        circleImage: {
            height: 100,
            width: 100,
            borderRadius: 15,
            alignSelf: "center",
            ...props.style
        },
    })

    const fetchCircleImage = async () => {
        await axios.get(`${DOMAIN}/api/circle/` + props.circleID + '/image', RequestAccountHeader).then(response => {
            setRequestorImage({uri: response.data})
        }).catch((error:AxiosError) => {console.log(error); setRequestorImage(DEFAULT_CIRCLE_ICON)})
    }

    useEffect(() => {
        if (props.imageUri !== undefined && props.imageUri !== "" && props.imageUri !== null) setRequestorImage({uri: props.imageUri})
        else if (props.circleID !== undefined) fetchCircleImage();
    }, [])

    return <Image source={requestorImage} style={styles.circleImage} resizeMode="contain"></Image> 
}

export const CircleTouchable = (props:{circleProps: CircleListItem, onPress:(() => void)}):JSX.Element => {
    const styles = StyleSheet.create({
        opacity: {
            width: 250,
            height: 100,
            borderRadius: 10,

        },
        header: {
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            width: 250,
            height: 65,
            borderRadius: 15,

        },
        column: {
            flexDirection: "column",
            width: 200,
            height: 55,
        },
        circleNameText: {
            ...theme.title,
            fontSize: 20,
            textAlign: "center"
        },
        circleImage: {
            height: 50,
            width: 50,
            borderRadius: 40,
            alignSelf: "center"
        },
    });
    return (
        <View>
            <TouchableOpacity
                onPress={props.onPress}
                style={styles.opacity}
            >
                <View style={styles.header}>
                    <RequestorCircleImage 
                        imageUri={props.circleProps.image}
                        circleID={props.circleProps.circleID}
                        style={styles.circleImage}
                    />
                    <View style={styles.column}>
                        <Text style={styles.circleNameText}>{props.circleProps.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const EventTouchable = (props:{circleEvent:CircleEventListItem, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {
    const styles = StyleSheet.create({
        header: {
            width: 200,
            height: 150,
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            justifyContent: "center"
        },
        container: {    
            justifyContent: "center",
            alignItems: "center"
        },
        opacity: {
            width: 200,
            height: 150,
            borderRadius: 15,
            marginHorizontal: 5,
        },
        titleText: {
            ...theme.primary,
            color: COLORS.primary,
            alignSelf: "center",
            //lineHeight: 15,
            fontWeight: "800",
        },
        descriptionText: {
            ...theme.text,
            color: COLORS.white,
            alignSelf: "center",
            alignItems: "center",
            justifyContent:"center",
            textAlign: "center",
            fontSize: FONT_SIZES.S,
        },
        timeText: {
            ...theme.text,
            color: COLORS.white,
            alignSelf: "center",
            fontSize: 8,
            //lineHeight: 15
            marginBottom: 12,
        },
        eventImage: {
            height: 100,
            width: 190,
            borderRadius: 5,
            alignSelf: "center",
        },
        floating: {
            position: "absolute",
            alignSelf: "center",
            justifyContent: "center",
            backgroundColor: COLORS.grayDark+'ce',
            borderRadius: 10,
            top: 62,
            width: 145,
            height: 48,
        },
        descriptionView: {
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            flex: 1,
            width: 185
        }

    })
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={props.onPress}
                style={styles.opacity}

            >
                <View style={styles.header}>
                    <Image source={{uri: props.circleEvent.image}} style={styles.eventImage} resizeMode="contain"/>
                    <View style={styles.floating}>
                        <Text style={styles.titleText}>{props.circleEvent.name}</Text>
                        <Text style={styles.timeText}>{new Date(props.circleEvent.startDate as unknown as string).toDateString()}</Text>
                    </View>
                    <View style={styles.descriptionView}>
                        <Text style={styles.descriptionText}>{props.circleEvent.description}</Text>
                    </View>
                    

                </View>

            </TouchableOpacity>
        </View>
    );
}

export const CircleContact = (props:{circleRecipientData:RecipientFormCircleListItem, addCircleRecipient:((id:number) => void), removeCircleRecipient:((id:number) => void), addRemoveCircleRecipient:((id:number) => void), removeRemoveCircleRecipient:((id:number) => void)}):JSX.Element => {

    const [shareButtonText, setShareButtonText] = useState<RecipientStatusEnum>(props.circleRecipientData.recipientStatus);
    
    const handlePress = () => {
        switch(props.circleRecipientData.viewMode) {
            case RecipientFormViewMode.CREATING:
                if (shareButtonText == RecipientStatusEnum.NOT_SELECTED) {
                    props.addCircleRecipient(props.circleRecipientData.circleID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_ADD);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_ADD) {
                    props.removeCircleRecipient(props.circleRecipientData.circleID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                break;
            case RecipientFormViewMode.EDITING:
                if (shareButtonText == RecipientStatusEnum.NOT_SELECTED) {
                    props.addCircleRecipient(props.circleRecipientData.circleID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_ADD);
                }
                else if (shareButtonText == RecipientStatusEnum.CONFIRMED) {
                    props.addRemoveCircleRecipient(props.circleRecipientData.circleID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_REMOVE);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_ADD) {
                    props.removeCircleRecipient(props.circleRecipientData.circleID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_REMOVE) {
                    props.removeRemoveCircleRecipient(props.circleRecipientData.circleID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                break;
        }
    }

    const styles = StyleSheet.create({
        container: {
            marginRight: 5,
            marginLeft: 25,
            marginVertical: 10
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
        socialDataView: {
            backgroundColor: COLORS.primary,
            borderRadius: 5,
            //justifyContent: "center",
            position: "absolute",
            right: 2,
            bottom: 2,
            //alignSelf: "center",
            flexDirection: "row",
            width: 30
        },
        textStyle: {
            ...theme.text,
            fontWeight: '700',
            textAlign: "center"
        },
        shareButtonView:{
            borderWidth: 1,
            borderColor: COLORS.accent,
            width: 70,
            borderRadius: 5,
            //position: "absolute",
        },
        centerView: {
            position: "absolute",
            right: 10,
            justifyContent: "center",
            alignSelf: "center"
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.prayerRequestDataTopView}>
                <RequestorCircleImage style={{height: 40, width: 40}} imageUri={props.circleRecipientData.image} circleID={props.circleRecipientData.circleID}/>
                <View style={styles.middleData}>
                    <Text style={styles.nameText}>{props.circleRecipientData.name}</Text>
                </View>
                <View style={styles.centerView}>
                    <TouchableOpacity 
                        onPress={handlePress}
                    >  
                        <View style={styles.shareButtonView}>
                            <Text style={styles.textStyle}>{shareButtonText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
