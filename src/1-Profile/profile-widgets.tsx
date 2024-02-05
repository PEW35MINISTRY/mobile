import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { ImageStyle, ImageSourcePropType, StyleSheet, Image } from "react-native";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";

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
        if (props.imageUri !== undefined) setRequestorImage({uri: props.imageUri})
        else if (props.userID !== undefined) {
            if (props.userID == userID) setRequestorImage({uri: userProfileImage})
            else fetchProfileImage();
        }
    },[])
    return <Image source={requestorImage} style={styles.profileImage}></Image> 
}