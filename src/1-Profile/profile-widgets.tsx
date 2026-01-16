import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useRef } from "react";
import { ImageStyle, ImageSourcePropType, StyleSheet, Image, Text, View, TouchableOpacity, Modal} from "react-native";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { RecipientFormProfileListItem, RecipientFormViewMode, RecipientStatusEnum } from "../TypesAndInterfaces/config-sync/api-type-sync/recipient-types";
import { render } from 'react-dom';
import { CheckBox } from "../widgets";
import { DisplayItemType } from "../TypesAndInterfaces/config-sync/input-config-sync/search-config";

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

export const ProfileContact = (props:{profileRecipientData:RecipientFormProfileListItem, onButtonPress?: (id: number, item: DisplayItemType) => void}):JSX.Element => {

    const [selected, setSelected] = useState<boolean>([RecipientStatusEnum.CONFIRMED, RecipientStatusEnum.UNCONFIRMED_ADD].includes(props.profileRecipientData.recipientStatus) ? true : false)
    const [unconfirmed, setUnconfirmed] = useState<boolean>([RecipientStatusEnum.UNCONFIRMED_ADD, RecipientStatusEnum.UNCONFIRMED_REMOVE].includes(props.profileRecipientData.recipientStatus) ? true : false)

    const handlePress = () => {
       
        if (selected) props.onButtonPress && props.onButtonPress(props.profileRecipientData.userID, { ...props.profileRecipientData, selectionStatus: RecipientStatusEnum.NOT_SELECTED });
        else if (!selected) props.onButtonPress && props.onButtonPress(props.profileRecipientData.userID, { ...props.profileRecipientData, selectionStatus: RecipientStatusEnum.SELECTED });

        setSelected(!selected)
        setUnconfirmed(!unconfirmed)
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
                    <CheckBox 
                        onChange={handlePress}
                        checkboxStyle={ unconfirmed ? [RecipientStatusEnum.NOT_SELECTED, RecipientStatusEnum.UNCONFIRMED_ADD].includes(props.profileRecipientData.recipientStatus)  ? { backgroundColor: COLORS.accent} : {backgroundColor: COLORS.primary} : undefined}
                        initialState={selected}
                    />
                </View>
            </View>
        </View>
    )
}