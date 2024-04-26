import { DOMAIN } from '@env';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { EDIT_PROFILE_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import theme, { COLORS } from '../theme';

import HANDS from '../../assets/hands.png';
import PEW35 from '../../assets/pew35-logo.png';
import store from '../redux-store';

import { Controller, useForm } from "react-hook-form";
import { RootState, updateProfile } from '../redux-store';
import { Flat_Button, Icon_Button, Input_Field, Outline_Button, ProfileImage, Raised_Button } from '../widgets';
import ProfileImageSettings from './ProfileImageSettings';
import Ionicons from "react-native-vector-icons/Ionicons";
import { ProfileEditRequestBody } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import PartnerSettings from '../4-Partners/PartnerSettings';

// valid password requrements: One uppercase, one lowercase, one digit, one special character, 8 chars in length
//const validPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

const EditProfile = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    
    const [profileImageSettingsModalVisible, setProfileImageSettingsModalVisible] = useState(false);
    const [partnerSettingsModalVisible, setPartnerSettingsModalVisible] = useState(false);

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
        if (value !== userProfile[key]) { editedFields[key] = value; fieldsChanged = true; }
      }
      // send data to server
      if (fieldsChanged) {
        axios.patch(`${DOMAIN}/api/user/` + userProfile.userID, editedFields, RequestAccountHeader,
        ).then(response => {
            console.log("Profile edit success.");
            var updatedUserProfile = {...userProfile}
            var profileChange = false;
            for (const [key, value] of Object.entries(editedFields)) {
              //@ts-ignore - Only copy over InputFields that exist in ProfileResponse
              if (updatedUserProfile[key] !== undefined) {
                 //@ts-ignore
                updatedUserProfile[key] = editedFields[key]
                profileChange = true;
              }   
            }
            if (profileChange) {
              console.log("update redux");
              dispatch(updateProfile(
                updatedUserProfile
              ));
            }
            navigation.pop();
        }).catch(err => console.error("Failed to edit", err))
      }
      else navigation.pop();
      
    }

    const test = () => {
      formInputRef.current == null ? console.log("null") : formInputRef.current.onHandleSubmit();
    }

    return (
      <View style={styles.center}>
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
              text={"Partner Settings"}
              onPress={()=> setPartnerSettingsModalVisible(true)}
              buttonStyle={{borderRadius: 5, width: 250}}
            />
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
              visible={partnerSettingsModalVisible}
              onRequestClose={() => setPartnerSettingsModalVisible(false)}
              animationType='slide'
              transparent={true}
            >
              <PartnerSettings
                callback={() => setPartnerSettingsModalVisible(false)}
              />
            </Modal>
        </View>
            <View style={styles.backButtonView}>
              <TouchableOpacity
                  onPress={() => navigation.pop()}
              >
                  <View style={styles.backButton}>
                  <Ionicons 
                      name="return-up-back-outline"
                      color={COLORS.white}
                      size={30}
                  />
                  </View>
              </TouchableOpacity>
            </View>
      </View>
        
    );
}

const styles = StyleSheet.create({
  ...theme,
  header: {
    ...theme.header,
    marginVertical: 20,
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
},
backButton: {
  //position: "absolute",
  justifyContent: "center",
  //alignContent: "center",
  alignItems: "center",
  //bottom: 1,
  //right: 1,
  height: 55,
  width: 55,
  //backgroundColor: COLORS.accent,
  borderRadius: 15,
},
backButtonView: {
  position: "absolute",
  top: 1,
  left: 1
},

});

export default EditProfile;
