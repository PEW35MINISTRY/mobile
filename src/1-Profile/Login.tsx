import { DOMAIN } from '@env';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import theme, { COLORS } from '../theme';

import HANDS from '../../assets/hands.png';
import APPLE from '../../assets/logo-apple.png';
import FACEBOOK from '../../assets/logo-facebook.png';
import GOOGLE from '../../assets/logo-google.png';
import LOGO from '../../assets/logo.png';
import PEW35 from '../../assets/pew35-logo.png';
import { RootState, setAccount } from '../redux-store';
import { Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button } from '../widgets';
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAME } from '../TypesAndInterfaces/custom-types';

const Login = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    //TODO Temporary will utilize dynamic flow with sign-up and edit forms with validations
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userPressedSignup, setUserPressedSignup] = useState(false);

    const userID = useAppSelector((state: RootState) => state.account.userID);

    const onLogin = (event:GestureResponderEvent):void => {
        if(event) event.preventDefault();

        axios.post(`${DOMAIN}/login`, {
            email: username,
            password: password,
    
            }).then(response => {   
                console.log(`Welcome user ${response.data.userID}, ${response.data.userProfile.firstName}`, response.data.jwt);
                //console.log(response.data.userProfile);
                dispatch(setAccount({
                    jwt: response.data.jwt,
                    userID: response.data.userID,
                    userProfile: response.data.userProfile,
                }));
                navigation.navigate(BOTTOM_TAB_NAVIGATOR_ROUTE_NAME);
            }).catch(error => console.error('Failed Authentication', username, password, error));
    }

    const onGoogle = (event:GestureResponderEvent) => console.log(`Logging in via Google`);

    const onFacebook = (event:GestureResponderEvent) => console.log(`Logging in via Facebook`);

    const onApple = (event:GestureResponderEvent) => console.log(`Logging in via APPLE`);

    const onForgotPassword = (event:GestureResponderEvent) => navigation.navigate("EditProfile");

    const onSignUp = (event:GestureResponderEvent) => navigation.navigate("Signup");

    return (
    <View style={theme.background_view}>
        <Text style={styles.header} >Encouraging Prayer</Text>
        <Image source={LOGO} style={styles.logo} resizeMode='contain'></Image>
        <Input_Field
            label='Email:'
            value={username}
            onChangeText={setUsername}
            keyboardType='email-address'
        />
        <Input_Field
            label='Passsword:'
            value={password}
            onChangeText={setPassword}
            textContentType='password'
        />
        <Raised_Button buttonStyle={styles.sign_in_button}
            text='Sign In'
            onPress={onLogin}
        />
        <View style={theme.horizontal_row}>
            <Outline_Button text='Forgot Password' onPress={onForgotPassword} />
            <View style={theme.vertical_divider} ></View>
            <Flat_Button text='Create Account' onPress={onSignUp} />
        </View>
        <View style={theme.horizontal_row}>
            <Icon_Button source={GOOGLE} imageStyle={styles.social_icon} onPress={onGoogle}/>
            <Icon_Button source={FACEBOOK} imageStyle={styles.social_icon} onPress={onFacebook}/>
            <Icon_Button source={APPLE} imageStyle={styles.social_icon} onPress={onApple}/>
        </View>
        <Image source={PEW35} style={styles.pew35_logo}></Image>
        <Image source={HANDS} style={styles.hands_image} resizeMode='contain'></Image>
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
  }
});

export default Login;