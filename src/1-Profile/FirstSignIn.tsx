import { DOMAIN } from "@env";
import axios from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ImageSourcePropType, ImageRequireSource, Modal } from "react-native";
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from "react-native-image-picker";
import { CallbackParam, PROFILE_IMAGE_MIME_TYPES, StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState, updateProfileImage } from "../redux-store";
import theme, { COLORS } from "../theme";
import { Outline_Button, Raised_Button } from "../widgets";
import { ProfileImage } from "../widgets";
import ProfileImageSettings from "./ProfileImageSettings";
import PartnerSettings from "../4-Partners/PartnerSettings";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";

const FirstSignIn = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const DEFAULT_PROFILE_ICON = require("../../assets/profile-icon-blue.png");

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const [profileImageSettingsModalVisible, setProfileImageSettingsModalVisible] = useState(true);
    const [prayerPartnerSettingsModalVisible, setPrayerPartnerSettingsModalVisible] = useState(false);

    const [profileImageSettingsVisited, setProfileImageSettingsVisited] = useState(false);
    const [profilePartnerSetingsVisited, setProfilePartnerSettingsVisited] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
        }
    }

    useEffect(() => {
      if (profileImageSettingsVisited && profilePartnerSetingsVisited) navigation.navigate(ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME);

    }, [profileImageSettingsVisited, profilePartnerSetingsVisited])

    return (
        <View style={styles.center}>
            <View style={styles.background_view}>
            <Modal 
              visible={profileImageSettingsModalVisible}
              onRequestClose={() => {setProfileImageSettingsModalVisible(false); setProfileImageSettingsVisited(true); setPrayerPartnerSettingsModalVisible(true)}}
              animationType='slide'
              transparent={true}
            >
              <ProfileImageSettings 
                callback={() => {setProfileImageSettingsModalVisible(false); setProfileImageSettingsVisited(true); setPrayerPartnerSettingsModalVisible(true)}}
              />
            </Modal>
            <Modal 
              visible={prayerPartnerSettingsModalVisible}
              onRequestClose={() => {setPrayerPartnerSettingsModalVisible(false); setProfilePartnerSettingsVisited(true)}}
              animationType='slide'
              transparent={true}
            >
              <PartnerSettings 
                callback={() => {setPrayerPartnerSettingsModalVisible(false); setProfilePartnerSettingsVisited(true)}}
              />
            </Modal>
             </View>
        </View>
    )
}

const styles = StyleSheet.create({
    ...theme, 
    infoView: {
        ...theme.background_view,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "auto"
      },
      imageUploadButton: {
        height: 45,
        minWidth: 100,
        marginTop: 20,
        marginHorizontal: 10
      },
      imageUploadButtonText: {
        fontSize: 20
      },
      doneButton: {
        height: 50,
        position: "absolute",
        bottom: 20
      },
      titleText: {
        ...theme.header,
        marginBottom: 10,
        textAlign: "center"
      },
      profileImage: {
        height: 200,
        width: 200,
        borderRadius: 15,
        alignSelf: "center"

      },
      titleView: {
        position: "absolute",
        top: 20
      },
      inlineImageButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
      }
})

export default FirstSignIn;