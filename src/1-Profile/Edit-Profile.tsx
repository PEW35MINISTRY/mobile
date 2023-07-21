import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, Text, Image, StyleSheet, GestureResponderEvent, ScrollView } from 'react-native';
import axios from 'axios';
import { DOMAIN } from '@env';

import theme, {COLORS} from '../theme';
import { useAppSelector, useAppDispatch } from '../TypesAndInterfaces/hooks';
import { ProfileResponse, Props } from '../TypesAndInterfaces/profile-types';
import { EDIT_PROFILE_FIELDS, InputType } from '../TypesAndInterfaces/profile-field-config';

import store from '../redux-store';
import PEW35 from '../../assets/pew35-logo.png';
import HANDS from '../../assets/hands.png';

import { Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button } from '../widgets';
import { updateProfile, RootState } from '../redux-store';
import { useForm, Controller } from "react-hook-form"

const EditProfile = ({navigation}:Props):JSX.Element => {
    const dispatch = useAppDispatch();

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const axiosHeaderData = {
      headers: {
        "jwt": jwt, 
        "user-id": userID,
      }
    }
    
    // store user profile data as an indexable object
    const userProfileValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(userProfile)) {
      userProfileValues[key] = value;
    }

    // assign user profile data as default values for fields
    const inputFieldJSON: Record<string, string> = {};
    EDIT_PROFILE_FIELDS.forEach((field) => {
      if (userProfileValues[field.field]) inputFieldJSON[field.field] = userProfileValues[field.field];
    })

    const {
      control,
      handleSubmit,
      formState: { errors },
      clearErrors,
    } = useForm({
      defaultValues: inputFieldJSON
    });

    const onEditFields = (fieldData:any):void => {

      // filter out fields that didn't change
      const editedFields: Record<string, string> = {};
      for (const [key, value] of Object.entries(fieldData)) {
        if (value !== userProfileValues[key]) editedFields[key] = value as unknown as string;
      }

      // send data to server
      axios.patch(`${DOMAIN}/api/user/profile/` + userProfile.userID, editedFields, axiosHeaderData,
        ).then(response => {
            console.log("Profile edit success.");

            // IMPORTANT: The following assumes that this route will return the user's userRole, userRoleList, and walkLevel by default, and other fields that changed in addition.
            // IF THIS CHANGES, EDIT PROFILE WILL BREAK!
            if (Object.values(response.data).length > 3) {
              // something other than the password changed, and we need to save it to redux
              for (const [key, value] of Object.entries(userProfileValues)) {
                if (response.data[key]) userProfileValues[key] = response.data[key];
              }
              dispatch(updateProfile(
                userProfileValues
              ));
            }


            navigation.pop();
      }).catch(err => console.error("Failed to edit", err))
    }

    const renderInputFields = () => {
      var renderFields:JSX.Element[] = [];
      EDIT_PROFILE_FIELDS.forEach((field, index) => {
        switch(field.type) {
          case InputType.TEXT || InputType.NUMBER:
            renderFields.push(
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
            renderFields.push(
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
        }
      })
      return renderFields;
    } 
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