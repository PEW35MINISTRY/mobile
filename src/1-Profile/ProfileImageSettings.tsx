import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ImageSourcePropType, ImageRequireSource, SafeAreaView, Platform } from "react-native";
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from "react-native-image-picker";
import { CallbackParam, PROFILE_IMAGE_MIME_TYPES, StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState, updateProfileImage } from "../redux-store";
import theme, { COLORS } from "../theme";
import { Outline_Button, Raised_Button } from "../widgets";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";
import Toast from "react-native-toast-message";

const ProfileImageSettings = (props:{callback:(val:number) => void, continueNavigation?:boolean}):JSX.Element => {
    const dispatch = useAppDispatch();
    const DEFAULT_PROFILE_ICON = require("../../assets/profile-icon-blue.png");

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const [profileImageUri, setProfileImageUri] = useState<ImageSourcePropType>(DEFAULT_PROFILE_ICON);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
        }
    }

    const RequestImageHeader = {
      headers: {
        "jwt": jwt,
        "Content-Type": "",
      }
    }

    const profileImageSourceProp:ImageSourcePropType = {
      uri: userProfile.image
    }

    const postProfileImage = async (encodedImage:string, imageType:string) => {
        // Set content type of the request so the server can process the blob
        RequestImageHeader["headers"]["Content-Type"] = imageType || "";
  
        if (encodedImage !== undefined && imageType !== undefined) {
          ToastQueueManager.show({message: "Uploading profile image"});
          await axios.post(`${DOMAIN}/api/user/` + userID + `/image/` + userID + '-user-profile.' + imageType.substring(6), Buffer.from(encodedImage, 'base64'), RequestImageHeader).then(response => {
            dispatch(updateProfileImage(
              response.data
            ));
            ToastQueueManager.show({message: "Profile Image Saved"});

          }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
        
        }
        else {
          ToastQueueManager.show({message: "No Profile Image Selected"});
        }
      }

    const onOpenImagePicker = () => {
        const options = {
          mediaType: 'photo',
          includeBase64: true,
        } as ImageLibraryOptions;
  
         
        launchImageLibrary(options, (response:ImagePickerResponse) => {

          if (response.errorCode) {
            ToastQueueManager.show({message: "An unknown error occurred"})
          } else if (response.assets === undefined || response.assets[0].base64 === undefined || response.assets[0].type === undefined || response.assets[0].uri === undefined) {
            ToastQueueManager.show({message: "No image selected for upload"})
          } 
          else {
            // allowed mime types: 'image/png', 'image/jpg', 'image/jpeg'. Configurable in inputfield.ts
            if (!PROFILE_IMAGE_MIME_TYPES.includes(response.assets[0].type)) {
                ToastQueueManager.show({message: "Invalid image mime type. Valid choices are " + PROFILE_IMAGE_MIME_TYPES});
            }
            else {
              setProfileImageUri({uri: response.assets[0].uri});
              postProfileImage(response.assets[0].base64, response.assets[0].type)
            }
          }
        });
      }

      useEffect(() => {
        // set user's profile picture if its defined
        if (userProfile.image !== undefined) {
          setProfileImageUri(profileImageSourceProp);
        }
      }, [userProfile.image]);

    return (
      <SafeAreaView style={styles.infoView}>
          <View style={styles.titleView}>
            <Image source={profileImageUri} style={styles.profileImage} />
            <Text allowFontScaling={false} style={styles.titleText}>Avatar Settings</Text>
          </View>
          <Outline_Button 
              text={"Select Image"}
              onPress={onOpenImagePicker}
          />
              <Raised_Button buttonStyle={styles.doneButton}
              text={props.continueNavigation !== undefined && props.continueNavigation ? "Next" : "Done"}
              // since we don't know if we want to pop the screen off the stack or not, let the parent screen decide, not the component.
              onPress={() => props.callback(1)}
          />

          <Toast />
      </SafeAreaView>
        
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
        top: Platform.OS === 'ios' ? 50 : 30
      },
      inlineImageButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
      }
})

export default ProfileImageSettings;