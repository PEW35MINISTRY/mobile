import { DOMAIN } from '@env';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileEditRequestBody, ProfileResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { EDIT_PROFILE_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import type InputField from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import theme, { COLORS } from '../theme';

import HANDS from '../../assets/hands.png';
import PEW35 from '../../assets/pew35-logo.png';
import store from '../redux-store';

import { Controller, useForm } from "react-hook-form";
import { RootState, updateProfile } from '../redux-store';
import { Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button } from '../widgets';

// valid password requrements: One uppercase, one lowercase, one digit, one special character, 8 chars in length
//const validPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

const EditProfile = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    
    const RequestAccountHeader = {
      headers: {
        "jwt": jwt, 
      }
    }

    const createFormValues = ():Record<string, string> => {
      const formValues: Record<string, string> = {};
      EDIT_PROFILE_FIELDS.forEach((field) => {
        //@ts-ignore
        formValues[field.field] = userProfile[field.field] || field.value;
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

    const onEditFields = (formValues:Record<string, string>):void => {

      // filter out fields that didn't change
      const editedFields = {} as ProfileEditRequestBody;
      for (const [key, value] of Object.entries(formValues)) {
        //@ts-ignore
        if (value !== userProfile[key]) editedFields[key] = value;
      }
      // send data to server
      axios.patch(`${DOMAIN}/api/user/` + userProfile.userID, editedFields, RequestAccountHeader,
        ).then(response => {
            console.log("Profile edit success.");
            var updatedUserProfile = {...userProfile}
            var profileChange = false;
            for (const [key, value] of Object.entries(editedFields)) {
              //@ts-ignore - Only copy over InputFields that exist in ProfileResponse
              if (updatedUserProfile[key]) {
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

    const renderInputFields = ():JSX.Element[] => 
      (EDIT_PROFILE_FIELDS).map((field:InputField, index:number) => {
        switch(field.type) {
          case InputType.TEXT || InputType.NUMBER:
            return(
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
                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                    label={(errors[field.field] && field.validationMessage) || undefined}
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
                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                    label={(errors[field.field] && field.validationMessage) || undefined}
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
            <Text style={styles.header}>Edit Profile</Text>
            <ScrollView>
              {renderInputFields()}
            </ScrollView>
            <Raised_Button buttonStyle={styles.sign_in_button}
                text='Save Changes'
                onPress={handleSubmit(onEditFields)}
            />
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
  }

});

export default EditProfile;