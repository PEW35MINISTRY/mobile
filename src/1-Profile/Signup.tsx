import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, Text, Image, StyleSheet, GestureResponderEvent, ScrollView } from 'react-native';
import axios from 'axios';
import { DOMAIN } from '@env';
import { useSelector } from 'react-redux';
import { RoleEnum, getDateYearsAgo, getDOBMinDate, getDOBMaxDate } from '../TypesAndInterfaces/profile-field-config';


import theme, {COLORS} from '../theme';
import { useAppSelector, useAppDispatch } from '../TypesAndInterfaces/hooks';
import { Props } from '../TypesAndInterfaces/profile-types';
import { SIGNUP_PROFILE_FIELDS_STUDENT, InputType, InputField, FieldInput, getShortDate } from '../TypesAndInterfaces/profile-field-config';

import PEW35 from '../../assets/pew35-logo.png';
import HANDS from '../../assets/hands.png';

import { Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button, DOBPicker, Dropdown_Select } from '../widgets';
import { saveLogin, resetLogin, RootState } from '../redux-store';
import { render } from 'react-dom';
import { useForm, Controller, SubmitHandler } from "react-hook-form"

const minAge:Date = getDOBMaxDate(RoleEnum.STUDENT)
const maxAge:Date = getDOBMinDate(RoleEnum.STUDENT);

const Signup = ({navigation}:Props):JSX.Element => {
    const dispatch = useAppDispatch();
    const profileFields = SIGNUP_PROFILE_FIELDS_STUDENT;

    const inputFieldJSON: Record<string, string> = {};
    SIGNUP_PROFILE_FIELDS_STUDENT.forEach((field) => {
      inputFieldJSON[field.field] = field.toJSON().value as unknown as string;
    })

    const {
      control,
      handleSubmit,
      formState: { errors },
      clearErrors,
    } = useForm({
      defaultValues: inputFieldJSON
    });

    const onSignUp = (fieldData:any) => {
      clearErrors();

      // send data to server
      axios.post(`${DOMAIN}/signup`, fieldData
          ).then(response => {
            console.log("Sigup successful.", response.data.JWT);
            dispatch(saveLogin({
              jwt: response.data.jwt,
              userID: response.data.userID,
              userProfile: response.data.userProfile,
              }));
            navigation.pop();
      }).catch(err => console.error("Failed signup", err))
      
    }
    
    // create JSX elements based on field name
    const renderInputFields = () => {
      var renderFields:JSX.Element[] = [];
      console.log("errors", errors);

      SIGNUP_PROFILE_FIELDS_STUDENT.forEach((field, index) => {
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
            renderFields.push(
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
            renderFields.push(
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
                          console.log("response status", response.status)
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
            renderFields.push(
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
            renderFields.push(
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
        }
  
      });
      return renderFields;
    } 

    
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

export default Signup;