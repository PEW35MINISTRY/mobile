import { DOMAIN } from '@env';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HANDS from '../../assets/hands.png';
import PEW35 from '../../assets/pew35-logo.png';
import { SIGNUP_PROFILE_FIELDS_STUDENT } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, resetAccount, setAccount } from '../redux-store';
import theme, { COLORS } from '../theme';
import { Raised_Button } from '../widgets';
import ProfileImageSettings from './ProfileImageSettings';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signupCallback } from './Login';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface SignupParamList extends AppStackParamList {
  callback:(() => void);
}

type SignupProps = NativeStackScreenProps<SignupParamList, typeof ROUTE_NAMES.SIGNUP_ROUTE_NAME>;

const Signup = ({navigation, route}:SignupProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);

    
    const onSignUp = (formValues:Record<string, string | string[]>) => {
      // send data to server
      axios.post(`${DOMAIN}/signup`, formValues
          ).then(response => {
            console.log("Sigup successful.", response.data.jwt);
            dispatch(setAccount({
              jwt: response.data.jwt,
              userID: response.data.userID,
              userProfile: response.data.userProfile,
              }));
          // call callback via route
          signupCallback(navigation);
      }).catch(err => console.error("Failed signup", err))
      
    }

    return (
      <View style={styles.center}>
        <View style={theme.background_view}>
            <Text style={styles.header}>Create Profile</Text>
              <FormInput 
                fields={SIGNUP_PROFILE_FIELDS_STUDENT}
                onSubmit={onSignUp}
                ref={formInputRef}
              />
              <Raised_Button buttonStyle={styles.sign_in_button}
                text='Create Account'
                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
              />
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

export default Signup;