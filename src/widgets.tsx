//These are reusable widgets for app consistency
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { ColorValue, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, KeyboardTypeOptions, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle, ScrollView } from "react-native";
import { MultipleSelectList, SelectList } from 'react-native-dropdown-select-list';
import DateTimePickerModal, { ReactNativeModalDateTimePickerProps } from "react-native-modal-datetime-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { CircleAnnouncementListItem, CircleEventListItem, CircleListItem } from './TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { PrayerRequestCommentListItem, PrayerRequestListItem } from './TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { getDOBMinDate, getDOBMaxDate, RoleEnum } from './TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import type InputField from './TypesAndInterfaces/config-sync/input-config-sync/inputField';
import theme, { COLORS, FONTS, FONT_SIZES, RADIUS } from './theme';
import { useAppDispatch, useAppSelector } from "./TypesAndInterfaces/hooks";
import { RootState } from './redux-store';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { InputType, InputSelectionField, isListType } from './TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import { SelectListItem } from './TypesAndInterfaces/custom-types';
import { PrayerRequestTagEnum } from './TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';

export const Flat_Button = (props:{text:string|JSX.Element, buttonStyle?:ViewStyle, textStyle?:TextStyle, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {

    const styles = StyleSheet.create({
        textStyle: {
          ...theme.text,
          fontWeight: '700',
          ...props.textStyle,
        },
        buttonStyle: {            
            minWidth: 150,
            margin: 5,
            padding: 7,
            backgroundColor: COLORS.accent,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            ...props.buttonStyle,
          },
    });

    return ( <TouchableOpacity style={styles.buttonStyle} onPress={props.onPress}>
                 <Text style={styles.textStyle}>{props.text}</Text>
             </TouchableOpacity> );
}

export const Raised_Button = (props:{text:string|JSX.Element, buttonStyle?:ViewStyle, textStyle?:TextStyle, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {  
    const styles = StyleSheet.create({
        textStyle: {
            ...theme.title,
            color: COLORS.white,
            ...props.textStyle,
        },
        buttonStyle: {
            minWidth: 300,
            backgroundColor: COLORS.primary,
            shadowColor: 'rgba(0,0,0, .4)', // IOS
            shadowOffset: { height: 1, width: 1 }, // IOS
            shadowOpacity: 1, // IOS
            shadowRadius: 1, //IOS
            elevation: 2, // Android
            borderRadius: RADIUS,
            ...props.buttonStyle,
          },
    });

    return ( <Flat_Button {...props} textStyle={styles.textStyle} buttonStyle={styles.buttonStyle}/> );    
}

export const Outline_Button = (props:{text:string|JSX.Element, buttonStyle?:ViewStyle, textStyle?:TextStyle, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {  
    const styles = StyleSheet.create({
        buttonStyle: {
            borderWidth: 1,
            borderColor: COLORS.accent,
            backgroundColor: COLORS.black,
            ...props.buttonStyle,
          },
    });

    return ( <Flat_Button {...props} buttonStyle={styles.buttonStyle}/> );    
}

export const Input_Field = (props:{label?:string|JSX.Element, inputStyle?:TextStyle, labelStyle?:TextStyle, containerStyle?:ViewStyle,
    value:string, onChangeText:((text: string) => void), placeholder?:string, placeholderTextColor?:ColorValue, keyboardType?:KeyboardTypeOptions,
    textContentType?:any, validationLabel?:string, validationStyle?:TextStyle}):JSX.Element => {  

    const [labelColor, setLabelColor] = useState(COLORS.accent);
        
    const styles = StyleSheet.create({
        labelStyle: {
            ...theme.accent,
            color: COLORS.transparentWhite,
            textAlign: 'left',
            ...props.labelStyle,
        },
        inputStyle: {
            ...theme.text,
            fontSize: FONT_SIZES.L,
            width: 275,
            marginLeft: 15,
            paddingVertical: 5,
            paddingHorizontal: 15,
            color: COLORS.white,
            borderBottomWidth: 1,
            borderColor: COLORS.accent,
            backgroundColor: COLORS.black,
            ...props.inputStyle,
        },        
        containerStyle: {
            marginVertical: 5,
            ...props.containerStyle,
        },
        validationStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: "center",
            ...props.validationStyle,
        }
    });

    return ( <View style={styles.containerStyle}>
                {props.label && <Text style={styles.labelStyle}>{props.label}</Text>}
                <TextInput
                    onFocus={()=>setLabelColor(COLORS.accent)}
                    onBlur={()=>setLabelColor(COLORS.transparentWhite)}
                    style={styles.inputStyle}
                    onChangeText={props.onChangeText}
                    value={props.value}
                    placeholder={props.placeholder}
                    placeholderTextColor={props.placeholderTextColor || COLORS.transparentWhite}
                    keyboardType={props.keyboardType}
                    textContentType={props.textContentType}
                    secureTextEntry={props.textContentType === 'password'}
                />
                {props.validationLabel && <Text style={styles.validationStyle}>{props.validationLabel}</Text>}
            </View> );
}

export const Icon_Button = (props:{source:ImageSourcePropType, imageStyle:ImageStyle, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {
    return ( <TouchableOpacity onPress={props.onPress}>
                 <Image source={props.source} style={props.imageStyle} />
             </TouchableOpacity> );
}

export const DatePicker = (props:{validationLabel?:string|JSX.Element, buttonStyle?:ViewStyle, buttonText:string, onConfirm:((date:Date) => void), validationStyle?:TextStyle, defaultDate:string }):JSX.Element => {
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const styles = StyleSheet.create({
        containerStyle: {
            marginVertical: 5,
        },
        validationLabelStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: 'center',
            ...props.validationStyle
        }
    });

    return (
        <View style={styles.containerStyle}>
            <Outline_Button
                text={props.buttonText}
                buttonStyle={props.buttonStyle}
                onPress={(event:GestureResponderEvent) => setDatePickerVisible(true)}
            />
            <DateTimePickerModal 
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date:Date) => {props.onConfirm(date); setDatePickerVisible(false)}}
                onCancel={(event:Date) => setDatePickerVisible(false)}
                date={new Date(props.defaultDate)}
            />
            {props.validationLabel && <Text style={styles.validationLabelStyle}>{props.validationLabel}</Text>}
        </View>
    )
}

export const Dropdown_Select = (props:{validationLabel?:string, setSelected:((val:string) => void), data: SelectListItem[], placeholder?:string, boxStyle?:ViewStyle, validationStyle?:TextStyle, defaultOption?:SelectListItem }):JSX.Element => {
    const styles = StyleSheet.create({
        dropdownText: {
            color: COLORS.white,
            textAlign: "center",
            
        },
        dropdownSelected: {
            color: COLORS.white,
            textAlign: "center",
            flex: 1 
        },
        dropdown: {
            width: 300,
            marginLeft: 3,
            paddingVertical: 5,
            paddingHorizontal: 15,
        },
        containerStyle: {
            marginVertical: 5,
        },
        errorTextStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 5,
            ...props.validationStyle
        },
          
    });
    
    return (
        <View style={styles.containerStyle}>
            <SelectList 
                setSelected={(val: string) => props.setSelected(val)} 
                data={props.data}
                save="value"
                boxStyles={props.boxStyle} 
                dropdownTextStyles={styles.dropdownText}
                inputStyles={styles.dropdownSelected}
                placeholder={props.placeholder}
                defaultOption={props.defaultOption} 
             />
            {props.validationLabel && <Text style={styles.errorTextStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}

export const Multi_Dropdown_Select = (props:{validationLabel?:string, setSelected:((val:string) => void), data: SelectListItem[], placeholder?:string, boxStyle?:ViewStyle, validationStyle?:TextStyle, defaultOption?:SelectListItem[] }):JSX.Element => {

    const styles = StyleSheet.create({
        dropdownText: {
            color: COLORS.white,
            textAlign: "center",
            
        },
        dropdownSelected: {
            color: COLORS.white,
            textAlign: "center",
            flex: 1 
        },
        dropdown: {
            width: 300,
            marginLeft: 3,
            paddingVertical: 5,
            paddingHorizontal: 15,
        },
        containerStyle: {
            marginVertical: 5,
        },
        errorTextStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 5,
            ...props.validationStyle
        },
          
    });
    
    return (
        <View style={styles.containerStyle}>
            <MultipleSelectList 
                setSelected={(val: string) => props.setSelected(val)} 
                data={props.data}
                save="value"
                boxStyles={props.boxStyle} 
                dropdownTextStyles={styles.dropdownText}
                inputStyles={styles.dropdownSelected}
                placeholder={props.placeholder}
                // TODO - defaultOption for SelectList is not available yet. PR - https://github.com/danish1658/react-native-dropdown-select-list/pull/102
                //defaultOption={props.defaultOption} 
             />
            {props.validationLabel && <Text style={styles.errorTextStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}

export const ProfileImage = (props:{style?:ImageStyle}):JSX.Element => {
    const userProfileImage = useAppSelector((state: RootState) => state.account.userProfile.image);
    const DEFAULT_PROFILE_ICON = require("../assets/profile-icon-blue.png");

    const styles = StyleSheet.create({
        profileImage: {
            height: 100,
            width: 100,
            borderRadius: 15,
            alignSelf: "center",
            ...props.style
        },
    })

    return (
        <>
            { userProfileImage === undefined ?
                <Image source={DEFAULT_PROFILE_ICON} style={styles.profileImage}></Image> : <Image source={{uri: userProfileImage}} style={styles.profileImage}></Image>
            }

        </>

    );
}