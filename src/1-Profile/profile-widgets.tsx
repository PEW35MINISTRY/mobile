import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useRef } from "react";
import { ImageStyle, ImageSourcePropType, StyleSheet, Image, Text, View, TouchableOpacity, Modal} from "react-native";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { RecipientFormProfileListItem, RecipientFormViewMode, RecipientStatusEnum } from "../Widgets/RecipientIDList/recipient-types";
import { render } from 'react-dom';

export const RequestorProfileImage = (props:{style?:ImageStyle, imageUri?:string, userID?:number}):JSX.Element => {
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfileImage = useAppSelector((state: RootState) => state.account.userProfile.image);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const DEFAULT_PROFILE_ICON = require("../../assets/profile-icon-blue.png");

    const [requestorImage, setRequestorImage] = useState<ImageSourcePropType>(DEFAULT_PROFILE_ICON);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const styles = StyleSheet.create({
        profileImage: {
            height: 100,
            width: 100,
            borderRadius: 15,
            alignSelf: "center",
            ...props.style
        },
    })

    const fetchProfileImage = async () => {
        await axios.get(`${DOMAIN}/api/user/` + props.userID + '/image', RequestAccountHeader).then(response => {
            // Toast override: no action on 404, display default image instead
            setRequestorImage({uri: response.data})
        }).catch((error:AxiosError) => setRequestorImage(DEFAULT_PROFILE_ICON))
    }

    useEffect(() => {
        if (props.userID !== undefined && props.userID === userID && userProfileImage !== undefined) {
            setRequestorImage({uri: userProfileImage})
        }
        else if (props.imageUri !== undefined && props.imageUri !== "" && props.imageUri !== null) setRequestorImage({uri: props.imageUri})
        else if (props.userID !== undefined) fetchProfileImage();
    },[userProfileImage, props.imageUri, props.userID]);

    return <Image source={requestorImage} style={styles.profileImage} resizeMode="contain"></Image> 
}

export const ProfileContact = (props:{profileRecipientData:RecipientFormProfileListItem, addUserRecipient:((id:number) => void), removeUserRecipient:((id:number) => void), addRemoveUserRecipient:((id:number) => void), removeRemoveUserRecipient:((id:number) => void)}):JSX.Element => {

    const [shareButtonText, setShareButtonText] = useState<RecipientStatusEnum>(props.profileRecipientData.recipientStatus);

    const handlePress = () => {
        switch(props.profileRecipientData.viewMode) {
            case RecipientFormViewMode.CREATING:
                if (shareButtonText == RecipientStatusEnum.NOT_SELECTED) {
                    props.addUserRecipient(props.profileRecipientData.userID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_ADD);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_ADD) {
                    props.removeUserRecipient(props.profileRecipientData.userID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                break;
            case RecipientFormViewMode.EDITING:
                if (shareButtonText == RecipientStatusEnum.NOT_SELECTED) {
                    props.addUserRecipient(props.profileRecipientData.userID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_ADD);
                }
                else if (shareButtonText == RecipientStatusEnum.CONFIRMED) {
                    props.addRemoveUserRecipient(props.profileRecipientData.userID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_REMOVE);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_ADD) {
                    props.removeUserRecipient(props.profileRecipientData.userID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_REMOVE) {
                    props.removeRemoveUserRecipient(props.profileRecipientData.userID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                break;
        }
    }

    const styles = StyleSheet.create({
        container: {
            marginLeft: 25,
            marginVertical: 10,
            marginRight: 10
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
            maxWidth: '65%'
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
            position: "absolute",
            right: 2,
            bottom: 2,
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
        },
        ShareButtonTopLevelView: {
            position: "absolute",
            right: 10,
            justifyContent: "center",
            alignSelf: "center"
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.prayerRequestDataTopView}>
                <RequestorProfileImage style={{height: 40, width: 40}} imageUri={props.profileRecipientData.image} userID={props.profileRecipientData.userID}/>
                <View style={styles.middleData}>
                    <Text allowFontScaling={false} style={styles.nameText}>{props.profileRecipientData.displayName}</Text>
                </View>
                <View style={styles.ShareButtonTopLevelView}>
                    <TouchableOpacity 
                        onPress={handlePress}
                    >  
                        <View style={styles.shareButtonView}>
                            <Text allowFontScaling={false} style={styles.textStyle}>{shareButtonText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
           

        </View>
    )
}