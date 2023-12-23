import { DOMAIN } from '@env';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getDateYearsAgo, getDOBMaxDate, getDOBMinDate, RoleEnum, SIGNUP_PROFILE_FIELDS_STUDENT } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import theme, { COLORS } from '../theme';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import InputField, { FieldInput, InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import HANDS from '../../assets/hands.png';
import PEW35 from '../../assets/pew35-logo.png';
import { render } from 'react-dom';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { resetAccount, RootState, setAccount, updateProfile } from '../redux-store';
import { DOBPicker, Dropdown_Select, Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button } from '../widgets';
import {launchImageLibrary} from 'react-native-image-picker';
import type { ImageLibraryOptions, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { ProfileResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAME } from '../TypesAndInterfaces/custom-types';
import { PROFILE_IMAGE_MIME_TYPES } from '../TypesAndInterfaces/custom-types';
import { Buffer } from 'buffer';

const minAge:Date = getDOBMaxDate(RoleEnum.STUDENT)
const maxAge:Date = getDOBMinDate(RoleEnum.STUDENT);

const Signup = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const [showImageUploadModal, setShowImageUploadModal] = useState(false);
    const [profileImage, setProfileImage] = useState("");
    const [profileImageType, setProfileImageType] = useState("");
    const RequestAccountHeader = {
      headers: {
        "jwt": jwt,
        "Content-Type": "",
      }
    }

    const createFormValues = ():Record<string, string> => {
      const formValues: Record<string, string> = {};
      SIGNUP_PROFILE_FIELDS_STUDENT.forEach((field) => {
        formValues[field.field] = field.value || "";
      });
      return formValues;
    }

    const {
      control,
      handleSubmit,
      formState: { errors },
      clearErrors,
    } = useForm({
      defaultValues: createFormValues()
    });

    const postProfileImage = async () => {
      // Set content type of the request so the server can process the blob
      RequestAccountHeader["headers"]["Content-Type"] = profileImageType;

      if (profileImage !== "") {
        // use ByteBuffer to decode the base64 string
        await axios.post(`${DOMAIN}/api/user/` + userID + `/image/` + userID + '-user-profile.' + profileImageType.substring(6), Buffer.from(profileImage, 'base64'), RequestAccountHeader).then(response => {
          const updatedProfile = {...userProfile}
          
          // TODO - wait for POST_profile_picture_upload refactor and save image url to redux
          /*
          updatedProfile.image = response.data
          dispatch(updateProfile(

          ))
          */
          setShowImageUploadModal(false);
          navigation.pop();
        }).catch(error => console.log(error));
      
      }
      else {
        console.warn("No profile picture selected");
      }
    }

    const onSignUp = (formData:Record<string, string>) => {
      // react-hook-form performs validation checks, if pass then save the form data and trigger image selection modal
      // send data to server

      /*
      axios.post(`${DOMAIN}/signup`, formData
        ).then(response => {
          console.log("Sigup successful.", response.data);
          dispatch(setAccount({
            jwt: response.data.jwt,
            userID: response.data.userID,
            userProfile: response.data.userProfile,
          }));
          setShowImageUploadModal(true);
        }).catch(err => console.error("Failed signup", err)
      );      
      */
      axios.post(`${DOMAIN}/login`, {
        email: "a@z.com",
        password: "12345",

        }).then(response => {   
            //console.log(`Welcome user ${response.data.userID}, ${response.data.userProfile.firstName}`, response.data.jwt);
            //console.log(response.data.userProfile);
            dispatch(setAccount({
                jwt: response.data.jwt,
                userID: response.data.userID,
                userProfile: response.data.userProfile,
            }));
            setShowImageUploadModal(true);
        }).catch(error => console.error('Nerd'));
      
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

    // create JSX elements based on field name
    const renderInputFields = ():JSX.Element[] => 
      (SIGNUP_PROFILE_FIELDS_STUDENT).map((field:InputField, index:number) => {
        switch(field.type) {
          case InputType.TEXT || InputType.NUMBER:
            return (
              <Controller 
                control={control}
                rules={{
                  required: field.required,
                  pattern: field.validationRegex
                }}
                render={({ field: {onChange, onBlur, value}}) => (
                  <Input_Field 
                    placeholder={field.title}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={(field.type === InputType.NUMBER && "numeric") || "default"}
                    validationStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                  />
                )}
                name={field.field}
                key={field.field}
              />
            );
            break;
          case InputType.PASSWORD:
            return (
              <Controller 
                control={control}
                rules={{
                  required: field.required,
                  pattern: field.validationRegex,
                  validate: (value, formValues) => {
                     if (field.field === "passwordVerify") {
                       if (value == formValues["password"]) return true;
                       else return false;
                     }
                     else {
                       return true;
                     }
                  }
                  
                }}
                render={({ field: {onChange, onBlur, value}}) => (
                  <Input_Field 
                    placeholder={field.title}
                    value={value}
                    onChangeText={onChange}
                    keyboardType='default'
                    textContentType='password'
                    validationStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                  />
                )}
                name={field.field}
                key={field.field}
              />
            );
            break;
          case InputType.EMAIL:
            return (
              <Controller 
                control={control}
                rules={{
                  required: field.required,
                  pattern: field.validationRegex,
                  validate: async (value, formValues) => {
                     var responseStatus = false;
                     if (value.match(field.validationRegex)) {
                       // check server to see if account with that email address exists
                       
                        await axios.get(`${DOMAIN}/resources/available-account?email=` + value).then((response) => {
                          responseStatus = true;
                          if (response.status == 204) return true;
                    
                        }).catch(err => console.log("err", err));

                        // if the axios request returned an error, return validation failure
                        if (!responseStatus) return false;
                     } 
                     else return false;
                     
                  }
                  
                }}
                render={({ field: {onChange, onBlur, value}}) => (
                  <Input_Field 
                    placeholder={field.title}
                    value={value}
                    onChangeText={onChange}
                    keyboardType='email-address'
                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                    
                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                  />
                )}
                name={field.field}
                key={field.field}
              />
            );
            break;
          case InputType.SELECT_LIST:
            var selectListData:any[] = [];
            for (var i=0; i<field.selectOptionList.length; i++) {
              selectListData.push({key: i, value: field.selectOptionList[i]})
            }
            return (
              <Controller 
                control={control}
                rules={{
                  required: field.required,
                }}
                render={({ field: {onChange, onBlur, value}}) => (
                  <Dropdown_Select
                     setSelected={(val:string) => onChange(val)}
                     data={selectListData}
                     placeholder='Select Gender'
                     validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                     boxStyle={(errors[field.field] && {borderColor: COLORS.primary}) || {borderColor: COLORS.accent}}
                  />
                )}
                name={field.field}
                key={field.field}
              />
            );
            break;
          case InputType.DATE:
            return (
              <Controller 
                control={control}
                rules={{
                  required: field.required,
                  validate: (value, formValues) => {
                    const currAge = new Date(value);
                    console.log(minAge, maxAge, currAge);
                    if (currAge > minAge || currAge < maxAge) return false;
                    else return true;
                  }
                }}
                render={({ field: {onChange, onBlur, value}}) => (
                  <DOBPicker 
                    buttonText={field.title}
                    buttonStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                    onConfirm={(date:Date) => onChange(date.toISOString())}
                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                  />
                )}
                name={field.field}
                key={field.field}
              />
            );
            break;
            
          // Default case will likely never happen, but its here to prevent undefined behavior per TS
          default:
            return <></>
        }
  
      });

    
    return (
      
      <View style={styles.center}>
        <View style={theme.background_view}>
            <Text style={styles.header}>Create Profile</Text>
            <ScrollView>
              { renderInputFields() }
            </ScrollView>
            <Raised_Button buttonStyle={styles.sign_in_button}
              text='Create Account'
              onPress={handleSubmit(onSignUp)}
            />
            <Modal 
              visible={showImageUploadModal}
              animationType='slide'
              onRequestClose={() => {
                setShowImageUploadModal(false);
                navigation.pop();
              }}
            >
              <View style={styles.infoView}>
                <Text style={styles.titleText}>Select a Profile Picture</Text>
                <Outline_Button 
                  text={"Select Image"}
                  onPress={onOpenImagePicker}
                />
                <Raised_Button buttonStyle={styles.imageSubmitButton}
                    text={"Upload Image"}
                    onPress={postProfileImage}
                    textStyle={styles.imageSubmitButtonText}
                  />
              </View>
            </Modal>
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
  infoView: {
    ...theme.background_view,
    justifyContent: "center",
    alignItems: "center"
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
  imageSubmitButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: "absolute",
    bottom: 20
  },
  imageSubmitButtonText: {
    textAlignVertical: "center",
    textAlign: "center",
    marginTop: 0
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
  titleText: {
    ...theme.primary,
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 18,
    textAlign: "center"
},

});

export default Signup;