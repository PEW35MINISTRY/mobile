import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, Text, Image, StyleSheet, GestureResponderEvent, ScrollView } from 'react-native';
import axios from 'axios';
import { SelectList } from 'react-native-dropdown-select-list'
import DateTimePickerModal, { ReactNativeModalDateTimePickerProps } from "react-native-modal-datetime-picker";
import theme, {COLORS} from '../theme';
import { useAppSelector, useAppDispatch } from '../TypesAndInterfaces/hooks';
import { Props } from '../TypesAndInterfaces/app-types';

import PEW35 from '../../assets/pew35-logo.png';
import HANDS from '../../assets/hands.png';

import { Flat_Button, Icon_Button, Input_Field, Outline_Button, Raised_Button } from '../widgets';
import { saveLogin, resetLogin } from '../redux-store';

const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const validZipRegex = /^\d{5}(?:[-\s]\d{4})?$/;

// valid password requrements: One uppercase, one lowercase, one digit, one special character, 8 chars in length
const validPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
var dob:any = null;

const Signup = ({navigation}:Props):JSX.Element => {
    const dispatch = useAppDispatch();
    //TODO Temporary will utilize dynamic flow with sign-up and edit forms with validations

    const genderData = [
      {key: "1", value: "Male"},
      {key: "2", value: "Female"},
    ];
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validatePassword, setValidatePassword] = useState('');

    const [gender, setGender] = useState('');
    
    const [pickerIsVisible, setPickerIsVisible] = useState(false);
    const [zip, setZip] = useState('');

    const [displayName, setDisplayName] = useState('');
 
    const handleDateConfirm = (birthDate: ReactNativeModalDateTimePickerProps) => {
        dob = new Date(birthDate.toString());
        console.log(dob);
        toggleDatePicker();
    }
  
    const toggleDatePicker = () => {
        setPickerIsVisible(!pickerIsVisible);
    }

    const onSignUp = (event:GestureResponderEvent):void => {
        if (event) event.preventDefault();
        const today = new Date();
        const birthyearUTC = new Date(today.valueOf() - dob.valueOf()).getUTCFullYear();
        const userAge = Math.abs(birthyearUTC - 1970)
        console.log(userAge);

        if (firstName === '' || lastName === '' || password === '' || validatePassword === '' || gender === '' || zip === '' || displayName === '' || dob === null) console.error("All fields must be filled out.")
        else if (userAge > 19) console.error("Too old.");
        else if (userAge < 13) console.error("Too young.");
        else if (password !== validatePassword) console.error("Passwords don't match.")
        else if (!email.match(validEmailRegex)) console.error("Invalid email address");
        else if (!zip.match(validZipRegex)) console.error("Invalid Zip code.");
        else if (!password.match(validPasswordRegex)) console.error("Password does not meet requirements of app");

        // send data to server
        axios.post(`${process.env.DOMAIN}/signup`, {
            email: email,
            displayName: displayName,
            password: password,
            firstName: firstName,
            lastName: lastName,
            zip: zip,
            gender: gender,
            dob: dob,
            }).then(response => {
              console.log("Sigup successful.")
              dispatch(saveLogin({
                JWT: response.data.JWT,
                userId: response.data.userId,
                userProfile: response.data.userProfile,
                }));
        }).catch(err => console.error("Failed signup", displayName, password, err))

        // TODO: Navigate to landing screen, or to prayer matching screen
    }

    return (
      <View style={styles.center}>
        <View style={theme.background_view}>
            <Text style={styles.header}>Create Profile</Text>
            <ScrollView>
            <Input_Field
                placeholder='First Name'
                value={firstName}
                onChangeText={setFirstName}
                keyboardType='default'
            />
            <Input_Field
                placeholder='Last Name'
                value={lastName}
                onChangeText={setLastName}
                keyboardType='default'
            />
                        <Input_Field
                placeholder='Email Address'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
            />
            <Input_Field
                placeholder='Display Name'
                value={displayName}
                onChangeText={setDisplayName}
                keyboardType='default'
            />
            <Input_Field
                placeholder='Password'
                value={password}
                onChangeText={setPassword}
                textContentType='password'
            />
            <Input_Field
                placeholder='Verify Password'
                value={validatePassword}
                onChangeText={setValidatePassword}
                textContentType='password'
            />
            <Input_Field
                placeholder='Zip Code'
                value={zip}
                onChangeText={setZip}
                keyboardType='numeric'
            />
            <View style={styles.dropdown}>
                <SelectList 
                    setSelected={(val: React.SetStateAction<string>) => setGender(val)} 
                    data={genderData} 
                    save="value"
                    dropdownTextStyles={styles.dropdownText}
                    inputStyles={styles.dropdownSelected}
                    placeholder="Select Gender"
                />
            </View>
            <DateTimePickerModal 
                isVisible={pickerIsVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={toggleDatePicker}
            />

            <Flat_Button
              text="Date of Birth"
              onPress={toggleDatePicker}
            />


          </ScrollView>
            <Raised_Button buttonStyle={styles.sign_in_button}
                text='Create Account'
                onPress={onSignUp}
            />
            <Image source={PEW35} style={styles.pew35_logo}></Image>
            <Image source={HANDS} style={styles.hands_image} resizeMode='contain'></Image>
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