import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, SafeAreaView, Button} from 'react-native';
import theme, {COLORS} from '../theme';
import { useAppSelector, useAppDispatch } from '../TypesAndInterfaces/hooks';

import LOGO from '../../assets/logo.png';
import PEW35 from '../../assets/pew35-logo.png';
import HANDS from '../../assets/hands.png';
import FACEBOOK from '../../assets/logo-facebook.png';
import APPLE from '../../assets/logo-apple.png';
import GOOGLE from '../../assets/logo-google.png';


const Login = ():JSX.Element => {
    const dispatch = useAppDispatch();
    //TODO Temporary will utilize dynamic flow with sign-up and edit forms
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = () => console.log('Logging In...');

 
  return (
    <View style={theme.background_view}>
        <Text style={styles.header} >Encouraging Prayer</Text>
        <Image source={LOGO} style={styles.logo} resizeMode='contain'></Image>
        <TextInput
            style={theme.input}
            onChangeText={setUsername}
            value={username}
            placeholder='Username/Email'
            placeholderTextColor={COLORS.accent}
            keyboardType='email-address'
        />
        <TextInput
            style={theme.input}
            onChangeText={setPassword}
            value={password}
            placeholder='Passsword'
            placeholderTextColor={COLORS.accent}
            keyboardType='visible-password'
        />
        <Button 
            onPress={onLogin}
            title='Login'
            color={COLORS.primary}
            accessibilityLabel='Login into Encouraging Prayer'
        />
        <View style={theme.horizontal_row}>
            <Text style={styles.password_button} >Forgot Password</Text>
            <Text style={theme.divider} >|</Text>
            <Text style={styles.sign_up_button} >Create Account</Text>
        </View>
        <View style={theme.horizontal_row}>
            <Image source={GOOGLE} style={styles.social_icon}></Image>
            <Image source={FACEBOOK} style={styles.social_icon}></Image>
            <Image source={APPLE} style={styles.social_icon}></Image>
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
    marginTop: 40
  },
  logo: {
    height: 200,
    marginVertical: 30,
  },
  pew35_logo: {
    width: 100,
    height: 100,
    margin: 'auto',
  },
  social_icon: {
    width: 48,
    height: 48,
    marginHorizontal: 15,
  },
  hands_image: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
    opacity: 0.7
  },
  password_button: {
    ...theme.accent,
    color: COLORS.primary
  },
  sign_up_button: {
    ...theme.raised_button,
    ...theme.primary,
    backgroundColor: 'transparent',
    color: COLORS.accent
  }
});

export default Login;