//These are reusable widgets for app consistency
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, GestureResponderEvent, Image, ViewStyle, ColorValue, KeyboardTypeOptions, TextStyle, ImageSourcePropType, ImageStyle } from "react-native";
import theme, {COLORS, FONTS, FONT_SIZES, RADIUS} from './theme';
import { Icon } from '@rneui/themed';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import DateTimePickerModal, { ReactNativeModalDateTimePickerProps } from "react-native-modal-datetime-picker";
import { SelectList } from 'react-native-dropdown-select-list'
import { TabNavigationProps } from './TypesAndInterfaces/profile-types';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';

const defaultNavigationState:Record<string, boolean> = {
    "Circles": true,
    "Prayer": false,
    "Learn": false,
    "Profile": false,
}

const resetNavigationState:Record<string, boolean> = {
    ...defaultNavigationState,
    "Circles": false,
}

export const EventBubble = ():JSX.Element => {
    return (
        <View>
            
        </View>
    );
}

export const AnnouncementBubble = (props:{title:string, body:string}):JSX.Element => {
    const styles = StyleSheet.create({
        bubbleStyle: {
            backgroundColor: COLORS.primary
        },
        titleText: {
            ...theme.title,
            color: COLORS.white,
        },
        bodyText: {
            ...theme.text,
        }
    });

    return (
        <View>
            <TouchableOpacity style={styles.bubbleStyle}>
                
            </TouchableOpacity>
        </View>
    );
}

export const PrayerRequestBubble = ():JSX.Element => {
    return (
        <View>
            
        </View>
    );
}

export const CircleTabNavigator = (props:BottomTabBarProps):JSX.Element => {
    const [isFocused, setIsFocused] = useState(defaultNavigationState);

    const changeTab = (screenName:string) => {
        var newState = resetNavigationState;
        newState[screenName] = true;
        setIsFocused(newState);
        props.navigation.navigate(screenName);
    }

    const styes = StyleSheet.create({
        container: {
            justifyContent: "center",
            backgroundColor: COLORS.black,
            flexDirection: "row",
        },
        padding: {
            justifyContent: "flex-end",
            flexDirection: "row",
            marginBottom: 15, 
        },
        navTouchable: {
            backgroundColor: COLORS.black,
            borderRadius: 28,
            marginHorizontal: 30,
        },
    });

    return (
        <View style={styes.container}>
            <View style={styes.padding}>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Circles")}
                >
                    <Icon
                        name="circle"
                        color={(isFocused["Circles"] && COLORS.primary) || COLORS.accent}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Prayer")}
                >
                    <Icon
                        name="thumb_up"
                        color={(isFocused["Prayer"] && COLORS.primary) || COLORS.accent}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Learn")}
                >
                    <Icon
                        name="HomeOutlined"
                        color={(isFocused["Learn"] && COLORS.primary) || COLORS.accent}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Profile")}
                >
                    <Icon
                        name="HomeOutlined"
                        color={(isFocused["Profile"] && COLORS.primary) || COLORS.accent}
                        size={55}
                    />
                        
                </TouchableOpacity>
            </View>

        </View>
    )
}

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
            ...props.buttonStyle,
        },
        buttonStyle: {
            minWidth: 300,
            padding: 0,
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

export const DOBPicker = (props:{validationLabel?:string|JSX.Element, buttonStyle?:ViewStyle, buttonText:string, onConfirm:((date:Date) => void) }):JSX.Element => {
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const styles = StyleSheet.create({
        containerStyle: {
            marginVertical: 5,
        },
        validationLabelStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: 'center',
        }
    });

    return (
        <View style={styles.containerStyle}>
            <Outline_Button
                text={props.buttonText}
                buttonStyle={props.buttonStyle}
                onPress={(event:GestureResponderEvent) => setDatePickerVisible(!isDatePickerVisible)}
            />
            <DateTimePickerModal 
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={props.onConfirm}
                onCancel={(event:Date) => setDatePickerVisible(!isDatePickerVisible)}
            />
            {props.validationLabel && <Text style={styles.validationLabelStyle}>{props.validationLabel}</Text>}
        </View>
    )
}

export const Dropdown_Select = (props:{validationLabel?:string, setSelected:((val:string) => void), data: any, placeholder?:string, boxStyle?:ViewStyle}):JSX.Element => {
    const styles = StyleSheet.create({
        dropdownText: {
            color: COLORS.white,
            textAlign: "center",
        },
        dropdownSelected: {
            color: COLORS.white,
            textAlign: "center",
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
             />
            {props.validationLabel && <Text style={styles.errorTextStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}