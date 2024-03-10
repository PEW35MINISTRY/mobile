import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { ImageStyle, ImageSourcePropType, StyleSheet, Image, Text, View, TouchableOpacity} from "react-native";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import { ProfileListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { Outline_Button } from "../widgets";
import { RecipientFormProfileListItem, RecipientFormViewMode, RecipientStatusEnum } from "../Widgets/RecipientIDList/recipient-types";

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
            setRequestorImage({uri: response.data})
        }).catch((error:AxiosError) => {console.log(error)})
    }

    useEffect(() => {
        if (props.imageUri !== undefined && props.imageUri !== "") setRequestorImage({uri: props.imageUri})
        else if (props.userID !== undefined) {
            if (props.userID == userID) setRequestorImage({uri: userProfileImage})
            else fetchProfileImage();
        }
    },[])
    return <Image source={requestorImage} style={styles.profileImage}></Image> 
}

export const ProfileContact = (props:{profileRecipientData:RecipientFormProfileListItem, addUserRecipient:((id:number) => void), removeUserRecipient:((id:number) => void), addRemoveUserRecipient:((id:number) => void), removeRemoveUserRecipient:((id:number) => void)}):JSX.Element => {

    const [shareButtonText, setShareButtonText] = useState<RecipientStatusEnum>(props.profileRecipientData.status);

    const handlePress = () => {
        switch(props.profileRecipientData.viewMode) {
            case RecipientFormViewMode.CREATING:
                if (shareButtonText == RecipientStatusEnum.NOT_SELECTED) {
                    props.addUserRecipient(props.profileRecipientData.profileListData.userID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_ADD);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_ADD) {
                    props.removeUserRecipient(props.profileRecipientData.profileListData.userID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                break;
            case RecipientFormViewMode.EDITING:
                if (shareButtonText == RecipientStatusEnum.NOT_SELECTED) {
                    props.addUserRecipient(props.profileRecipientData.profileListData.userID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_ADD);
                }
                else if (shareButtonText == RecipientStatusEnum.CONFIRMED) {
                    props.addRemoveUserRecipient(props.profileRecipientData.profileListData.userID);
                    setShareButtonText(RecipientStatusEnum.UNCONFIRMED_REMOVE);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_ADD) {
                    props.removeUserRecipient(props.profileRecipientData.profileListData.userID);
                    setShareButtonText(RecipientStatusEnum.NOT_SELECTED);
                }
                else if (shareButtonText == RecipientStatusEnum.UNCONFIRMED_REMOVE) {
                    props.removeRemoveUserRecipient(props.profileRecipientData.profileListData.userID);
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
                <RequestorProfileImage style={{height: 40, width: 40}} imageUri={props.profileRecipientData.profileListData.image} userID={props.profileRecipientData.profileListData.userID}/>
                <View style={styles.middleData}>
                    <Text style={styles.nameText}>{props.profileRecipientData.profileListData.displayName}</Text>
                </View>
                <View style={styles.ShareButtonTopLevelView}>
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