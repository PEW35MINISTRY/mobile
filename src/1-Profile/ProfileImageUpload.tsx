import { DOMAIN } from "@env";
import axios from "axios";
import { Buffer } from "buffer";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from "react-native-image-picker";
import { PROFILE_IMAGE_MIME_TYPES, ProfileImageUploadParams, StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState, updateProfileImage } from "../redux-store";
import theme, { COLORS } from "../theme";
import { Outline_Button, Raised_Button } from "../widgets";

const ProfileImageUpload = ({callback}:ProfileImageUploadParams):JSX.Element => {
    const dispatch = useAppDispatch();

    const [profileImage, setProfileImage] = useState("");
    const [profileImageType, setProfileImageType] = useState("");

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
          "Content-Type": "",
        }
      }

    const postProfileImage = async () => {
        // Set content type of the request so the server can process the blob
        RequestAccountHeader["headers"]["Content-Type"] = profileImageType;
  
        if (profileImage !== "") {
          // use ByteBuffer to decode the base64 string
          await axios.post(`${DOMAIN}/api/user/` + userID + `/image/` + userID + '-user-profile.' + profileImageType.substring(6), Buffer.from(profileImage, 'base64'), RequestAccountHeader).then(response => {
            dispatch(updateProfileImage(
              response.data
            ));

            // TODO: add toast message to indicate success
          }).catch(error => console.log(error));
        
        }
        else {
          console.warn("No profile picture selected");
        }
      }

    const onOpenImagePicker = () => {
        const options = {
          mediaType: 'photo',
          includeBase64: true,
        } as ImageLibraryOptions;
  
         
        launchImageLibrary(options, (response:ImagePickerResponse) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('Image picker error: ', response.errorMessage);
          } else if (response.assets === undefined || response.assets?.[0].base64 === undefined || response.assets?.[0].type === undefined) {
            console.log("no image selected")
          } 
          else {
            const imageBase64 = response.assets[0].base64;
            const imageMimeType = response.assets[0].type;
  
            // allowed mime types: 'image/png', 'image/jpg', 'image/jpeg'
            if (!PROFILE_IMAGE_MIME_TYPES.includes(imageMimeType)) {
              console.log("Invalid image mime type. Valid choices are ", PROFILE_IMAGE_MIME_TYPES);
            }
            else {
              setProfileImage(imageBase64);
              setProfileImageType(imageMimeType)
            }
          }
        });
      }

    return (
        <View style={styles.infoView}>
            <Text style={styles.titleText}>Select a Profile Picture</Text>
            <Outline_Button 
                text={"Select Image"}
                onPress={onOpenImagePicker}
            />
            <Raised_Button buttonStyle={styles.imageUploadButton}
                text={"Upload"}
                onPress={postProfileImage}
                textStyle={styles.imageUploadButtonText}
            />
            <Raised_Button buttonStyle={styles.doneButton}
                text={"Done"}
                // since we don't know if we want to pop the screen off the stack or not, let the parent screen decide, not the component.
                onPress={callback}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    infoView: {
        ...theme.background_view,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "auto"
      },
      imageUploadButton: {
        height: 45,
        minWidth: 100,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
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
        ...theme.primary,
        fontSize: 22,
        color: COLORS.white,
        marginBottom: 10,
        textAlign: "center"
      },
})

export default ProfileImageUpload;