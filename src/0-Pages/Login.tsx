import { DOMAIN } from '@env';
import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useRef } from 'react';
import keychain from 'react-native-keychain'
import { GestureResponderEvent, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import theme, { COLORS } from '../theme';

import HANDS from '../../assets/hands.png';
import APPLE from '../../assets/logo-apple.png';
import FACEBOOK from '../../assets/logo-facebook.png';
import GOOGLE from '../../assets/logo-google.png';
import LOGO from '../../assets/logo.png';
import PEW35 from '../../assets/pew35-logo.png';
import TRANSPARENT from '../../assets/transparent.png';
import { RootState, setAccount, setJWT, setStorageState } from '../redux-store';
import { Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button } from '../widgets';
import { LOGIN_PROFILE_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { AppStackParamList, ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

export interface LoginParamList {
  newAccount?:boolean
}

type LoginProps = NativeStackScreenProps<AppStackParamList, typeof ROUTE_NAMES.LOGIN_ROUTE_NAME>;

const Login = ({navigation, route}:LoginProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);

    const localUserID = useAppSelector((state: RootState) => state.localStorage.userID);
    const localStorageStateRef = useAppSelector((state:RootState) => state.localStorage);

    const onLogin = (formValues:Record<string, string | string[]>) => {
        axios.post(`${DOMAIN}/login`, formValues).then(response => {   

          dispatch(setAccount({
              jwt: response.data.jwt,
              userID: response.data.userID,
              userProfile: response.data.userProfile,
          }));

          // Only need to set the JWT, but setting userID as well to prevent client and server from getting out of sync while offline
          dispatch(setStorageState({...localStorageStateRef, userID: response.data.userID, jwt: response.data.jwt}));
          keychain.setGenericPassword(response.data.userID.toString(), JSON.stringify({...localStorageStateRef, userID: response.data.userID, jwt: response.data.jwt}));

          navigation.navigate(localStorageStateRef.settings.skipAnimation ? ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME : ROUTE_NAMES.LOGO_ANIMATION_ROUTE_NAME);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error})); // ServerErrorResponse is in response. Check for network errors with axios error code "ERR_NETWORK"
    }

    
    const onGoogle = (event:GestureResponderEvent) => console.log(`Logging in via Google`);

    const onFacebook = (event:GestureResponderEvent) => console.log(`Logging in via Facebook`);

    const onApple = (event:GestureResponderEvent) => console.log(`Logging in via APPLE`);

    const onForgotPassword = (event:GestureResponderEvent) => console.log("Forgot Password");

    const onSignUp = (event:GestureResponderEvent) => navigation.navigate(ROUTE_NAMES.SIGNUP_ROUTE_NAME);

    useEffect(() => {
      if (route.params !== undefined) if (route.params.newAccount !== undefined) navigation.navigate(ROUTE_NAMES.INITIAL_ACCOUNT_FLOW_ROUTE_NAME);
    }, [route.params])

    useEffect(() => {
      const getLocalStorage = async () => {
        const result = await keychain.getGenericPassword();
        if (result) dispatch(setStorageState(JSON.parse(result.password)));
      }
      if (route.params === undefined) getLocalStorage();
    }, [])

    useEffect(() => {
      // only attempt auto-login for users that have accounts
      if (route.params === undefined && localUserID > 0) {
        console.log(localStorageStateRef)
        axios.post(`${DOMAIN}/api/authenticate`, {}, {headers: {"jwt": localStorageStateRef.jwt}}).then((response:AxiosResponse) => {
          dispatch(setJWT(response.data.jwt));
          dispatch(setAccount({
            jwt: response.data.jwt,
            userID: response.data.userID,
            userProfile: response.data.userProfile,
          }));

          // Only need to set the JWT, but setting userID as well to prevent client and server from getting out of sync while offline
          keychain.setGenericPassword(response.data.userID.toString(), JSON.stringify({...localStorageStateRef, jwt: response.data.jwt}));
          navigation.navigate(localStorageStateRef.settings.skipAnimation ? ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME : ROUTE_NAMES.LOGO_ANIMATION_ROUTE_NAME);
        }).catch((error:AxiosError<ServerErrorResponse>) => console.warn(error));
      }
    }, [localUserID])

    return (
      <SafeAreaView style={theme.background_view}>
        <Text style={styles.header}>Encouraging Prayer</Text>
        <Image source={LOGO} style={styles.logo} resizeMode='contain'></Image>
        <FormInput 
          fields={LOGIN_PROFILE_FIELDS}
          onSubmit={onLogin}
          validateUniqueFields={false}
          ref={formInputRef}
        />
        <Raised_Button buttonStyle={styles.sign_in_button}
            text='Sign In'
            onPress={() => formInputRef.current !== null  && formInputRef.current.onHandleSubmit()}
        />
        <View style={theme.horizontal_row}>
            <Outline_Button text='Forgot Password' onPress={onForgotPassword} />
            <View style={theme.vertical_divider} ></View>
            <Flat_Button text='Create Account' onPress={onSignUp} />
        </View>
        
        <View style={theme.horizontal_row}>
            <Icon_Button source={TRANSPARENT} imageStyle={styles.social_icon} onPress={onGoogle}/>
            <Icon_Button source={TRANSPARENT} imageStyle={styles.social_icon} onPress={onFacebook}/>
            <Icon_Button source={TRANSPARENT} imageStyle={styles.social_icon} onPress={onApple}/>
        </View>
        <Image source={PEW35} style={styles.pew35_logo}></Image>
        <Image source={HANDS} style={styles.hands_image} resizeMode='contain'></Image>
    </SafeAreaView>
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
  }
});

export default Login;