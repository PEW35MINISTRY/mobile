import { DOMAIN, ENVIRONMENT } from '@env';
import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import keychain from 'react-native-keychain'
import { render } from 'react-dom';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SIGNUP_PROFILE_FIELDS_USER } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, registerNotificationDevice, resetAccount, setAccount, setDeviceID } from '../redux-store';
import theme, { COLORS } from '../theme';
import { Raised_Button, BackButton, CheckBox } from '../widgets';
import ProfileImageSettings from './ProfileImageSettings';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { LoginResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/auth-types';
import InputField, { ENVIRONMENT_TYPE } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { getEnvironment } from '../utilities/utilities';
import { InputTypesAllowed } from '../TypesAndInterfaces/config-sync/input-config-sync/inputValidation';

const Signup = ({navigation}:StackNavigationProps):JSX.Element => {

    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);

    const [populateDemoProfile, setPopulateDemoProfile] = useState<boolean>(false);

    const onSignUp = (formValues:Record<string, InputTypesAllowed>) => {
      // send data to server
      axios.post(`${DOMAIN}/signup${populateDemoProfile ? '?populate=true' : ''}`, formValues).then((response:AxiosResponse<LoginResponseBody>) => {
        dispatch(setAccount({
          jwt: response.data.jwt,
          userID: response.data.userID,
          userProfile: response.data.userProfile,
        }));

        dispatch(registerNotificationDevice);

        // call callback via route
        navigation.navigate(ROUTE_NAMES.LOGIN_ROUTE_NAME, {newAccount: true})
      }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
      
    }

    return (
      <SafeAreaView style={styles.backgroundView}>
        <View style={theme.background_view}>
            <Text allowFontScaling={false} style={styles.header}>Create Profile</Text>
              <FormInput 
                fields={SIGNUP_PROFILE_FIELDS_USER.filter((field:InputField)=>field.environmentList.includes(getEnvironment()))}
                modelIDFieldDetails={({ modelIDField: 'userID', modelID: -1 })}
                onSubmit={onSignUp}
                ref={formInputRef}
              />
              {
                [ENVIRONMENT_TYPE.LOCAL, ENVIRONMENT_TYPE.DEVELOPMENT].includes(getEnvironment()) && <CheckBox onChange={() => setPopulateDemoProfile(!populateDemoProfile)} label='Populate Demo Profile' />
              }
              <Raised_Button buttonStyle={styles.sign_in_button}
                text='Create Account'
                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
              />
        </View>
        <BackButton navigation={navigation} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
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
    ...theme.center,
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
});

export default Signup;