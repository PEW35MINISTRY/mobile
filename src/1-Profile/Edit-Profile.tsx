import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import keychain from 'react-native-keychain'
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, SafeAreaView, Platform } from 'react-native';

import { EDIT_PROFILE_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import theme, { COLORS } from '../theme';

import HANDS from '../../assets/hands.png';
import PEW35 from '../../assets/pew35-logo.png';
import store, { setSettings } from '../redux-store';

import { Controller, useForm } from "react-hook-form";
import { RootState, updateProfile } from '../redux-store';
import { BackButton, CheckBox, Flat_Button, Icon_Button, Input_Field, Outline_Button, ProfileImage, Raised_Button } from '../widgets';
import ProfileImageSettings from './ProfileImageSettings';
import Ionicons from "react-native-vector-icons/Ionicons";
import { ProfileEditRequestBody } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import Partnerships from '../4-Partners/Partnerships';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

// valid password requrements: One uppercase, one lowercase, one digit, one special character, 8 chars in length
//const validPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

const EditProfile = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const localStorageRef = useAppSelector((state: RootState) => state.localStorage);
    
    const [profileImageSettingsModalVisible, setProfileImageSettingsModalVisible] = useState(false);
    const [partnersModalVisible, setPartnersModalVisible] = useState(false);
    const [toggleShowAnimation, setToggleShowAnimation] = useState<boolean>(localStorageRef.settings.skipAnimation);

    const RequestAccountHeader = {
      headers: {
        "jwt": jwt, 
      }
    }

    const onEditProfile = (formValues:Record<string, string | string[]>):void => {

      // if no fields change, don't bother sending an empty update request to the server
      var fieldsChanged = false;

      // filter out fields that didn't change
      const editedFields = {} as ProfileEditRequestBody;
      for (const [key, value] of Object.entries(formValues)) {
        //@ts-ignore
        if (value !== userProfile[key] && value !== "") { editedFields[key] = value; fieldsChanged = true; }
      }

      // send data to server
      if (fieldsChanged) {
        axios.patch(`${DOMAIN}/api/user/` + userProfile.userID, editedFields, RequestAccountHeader).then(response => {
            var updatedUserProfile = {...userProfile}
            var profileChange = false;
            for (const [key, value] of Object.entries(editedFields)) {
              //@ts-ignore - Only copy over InputFields that exist in ProfileResponse
              if (updatedUserProfile[key] !== undefined) {
                 //@ts-ignore
                updatedUserProfile[key] = editedFields[key];
                profileChange = true;
              }   
            }
            if (profileChange) {
              dispatch(updateProfile(
                updatedUserProfile
              ));
            }
            navigation.pop();
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
      }
      else if (toggleShowAnimation !== localStorageRef.settings.skipAnimation) { 
        dispatch(setSettings({...localStorageRef.settings, skipAnimation: toggleShowAnimation}));
        keychain.setGenericPassword(userID.toString(), JSON.stringify({...localStorageRef, settings: {...localStorageRef.settings, skipAnimation: toggleShowAnimation}}))
        navigation.pop();
      }
      else navigation.pop();
    }

    return (
      <SafeAreaView style={styles.backgroundView}>
        <View style={theme.background_view}>
          <TouchableOpacity
            onPress={() => setProfileImageSettingsModalVisible(true)}

          >
            <View style={styles.profileImageContainer}>
              <ProfileImage />
              <View style={styles.floatingEditIcon}>
                <Ionicons 
                  name="pencil-outline"
                  color={COLORS.white}
                  size={20}
                />
              </View>
            </View>
          </TouchableOpacity>
            <Text style={styles.header}>Edit Profile</Text>
              <FormInput 
                fields={EDIT_PROFILE_FIELDS}
                defaultValues={userProfile}
                onSubmit={onEditProfile}
                ref={formInputRef}
              />
            <Outline_Button 
              text={"Partnerships"}
              onPress={()=> setPartnersModalVisible(true)}
              buttonStyle={{borderRadius: 5, width: 250}}
            />
            <View style={{marginTop: 10}}>
              <CheckBox onChange={() => setToggleShowAnimation(!toggleShowAnimation)} label='Skip logo animation on login' initialState={toggleShowAnimation} />
            </View>
            <Raised_Button buttonStyle={styles.sign_in_button}
                text='Save Changes'
                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
            />

            <Modal
              visible={profileImageSettingsModalVisible}
              onRequestClose={() => setProfileImageSettingsModalVisible(false)}
              animationType='slide'
              transparent={true}
            >
              <ProfileImageSettings 
                callback={() => setProfileImageSettingsModalVisible(false)}
              />
            </Modal>
            <Modal
              visible={partnersModalVisible}
              onRequestClose={() => setPartnersModalVisible(false)}
              animationType='slide'
              transparent={true}
            >
              <Partnerships
                callback={() => setPartnersModalVisible(false)}
              />
            </Modal>
        </View>
            <BackButton navigation={navigation} callback={() => navigation.pop()} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
      </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
  ...theme,
  header: {
    ...theme.header,
    marginVertical: 20,
  },
  backgroundView: {
    //...theme.center,
    flex: 1,
    backgroundColor: COLORS.black
  },
  logo: {
    height: 175,
    marginBottom: 10,
  },
  pew35_logo: {
    height: 75,
    width: 75,
    bottom: 0,
  },
  social_icon: {
    width: 35,
    height: 35,
    marginHorizontal: 15,
  },
  hands_image: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
    opacity: 0.6
  },
  sign_in_button: {
    marginVertical: 15,
  },
  dropdownText: {
    color: COLORS.white,
  },
  dropdownSelected: {
    color: COLORS.white,
  },
  dropdown: {
    width: 300,
    marginLeft: 3,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  imageUploadButton: {
    height: 45,
    marginTop: 30,
    
  },
  imageUploadButtonText: {
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center"
  },
  profileImageMainPage: {
    height: 100,
    width: 100,
    borderRadius: 15,
    alignSelf: "center",
},
profileImageContainer: {
  justifyContent: "center",
  alignItems: "center",
  top: 20
},
floatingEditIcon: {
  position: "absolute",
  alignSelf: "center",
  alignItems: "center",
  bottom: 0,
  right: 0,
  justifyContent: "center",
  backgroundColor: COLORS.grayDark+'ce',
  borderRadius: 10,
  width: 35,
  height: 35
}

});

export default EditProfile;
