import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, SafeAreaView, Button} from 'react-native';
import theme, {COLORS} from '../theme';
import { useAppSelector, useAppDispatch } from '../TypesAndInterfaces/hooks';

import LOGO from '../../assets/logo.png';
import PEW35 from '../../assets/pew35-logo.png';
import FACEBOOK from '../../assets/pew35-logo.png';
import APPLE from '../../assets/pew35-logo.png';
import GOOGLE from '../../assets/pew35-logo.png';


const Login = ():JSX.Element => {
    const dispatch = useAppDispatch();
    //TODO Temporary will utilize dynamic flow with sign-up and edit forms
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = () => console.log('Logging In...');

 
  return (
    <View style={theme.background_view}>
    <Text style={theme.header} >Encouraging Prayer</Text>
    <Image source={LOGO} style={styles.logo}></Image>
    <TextInput
        style={theme.input}
        onChangeText={setUsername}
        value={username}
        placeholder='Username/Email'
        keyboardType='default'
    />
    <TextInput
        style={theme.input}
        onChangeText={setPassword}
        value={password}
        placeholder='Passsword'
        keyboardType='visible-password'
    />
    <Button 
        onPress={onLogin}
        title='Login'
        color={COLORS.primary}
        accessibilityLabel='Login into Encouraging Prayer'
    />
    <View style={theme.horizontal_row}>
        <Image source={GOOGLE} style={styles.social_icon}></Image>
        <Image source={FACEBOOK} style={styles.social_icon}></Image>
        <Image source={APPLE} style={styles.social_icon}></Image>
    </View>
    <View style={theme.horizontal_row}>
        <Text style={styles.password_button} >Forgot Password</Text>
        <Text style={theme.divider} >|</Text>
        <Text style={styles.sign_up_button} >Create Account</Text>
    </View>
    <Image source={PEW35} style={styles.pew35_logo}></Image>
    </View>
  );
}


const styles = StyleSheet.create({
  ...theme,
  logo: {
    width: 200,
    height: 200,
    margin: 'auto',
  },
  pew35_logo: {
    width: 100,
    height: 100,
    margin: 'auto',
  },
  social_icon: {
    width: 25,
    height: 25,
    margin: 10,
  },
  password_button: {
    ...theme.accent,
    color: COLORS.primary
  },
  sign_up_button: {
    ...theme.primary,
    color: COLORS.accent
  }
});

export default Login;