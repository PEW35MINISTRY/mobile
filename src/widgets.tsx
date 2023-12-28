//These are reusable widgets for app consistency
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { symbol } from 'prop-types';
import React, { useState } from 'react';
import { ColorValue, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, KeyboardTypeOptions, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import DateTimePickerModal, { ReactNativeModalDateTimePickerProps } from "react-native-modal-datetime-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { CircleAnnouncementListItem, CircleEventListItem, CircleListItem } from './TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { PrayerRequestListItem } from './TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { TabNavigationProps } from './TypesAndInterfaces/custom-types';
import theme, { COLORS, FONTS, FONT_SIZES, RADIUS } from './theme';

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

export const EventTouchable = (props:{circleEvent:CircleEventListItem, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {
    const styles = StyleSheet.create({
        header: {
            width: 200,
            height: 150,
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            justifyContent: "center"
        },
        container: {    
            justifyContent: "center",
            alignItems: "center"
        },
        opacity: {
            width: 200,
            height: 150,
            borderRadius: 15,
            marginHorizontal: 5,
        },
        titleText: {
            ...theme.primary,
            color: COLORS.primary,
            alignSelf: "center",
            //lineHeight: 15,
            fontWeight: "800",
        },
        descriptionText: {
            ...theme.text,
            color: COLORS.white,
            alignSelf: "center",
            alignItems: "center",
            justifyContent:"center",
            textAlign: "center",
            fontSize: FONT_SIZES.S,
        },
        timeText: {
            ...theme.text,
            color: COLORS.white,
            alignSelf: "center",
            fontSize: 8,
            //lineHeight: 15
            marginBottom: 12,
        },
        eventImage: {
            height: 100,
            width: 190,
            borderRadius: 5,
            alignSelf: "center",
        },
        floating: {
            position: "absolute",
            alignSelf: "center",
            justifyContent: "center",
            backgroundColor: COLORS.grayDark+'ce',
            borderRadius: 10,
            top: 62,
            width: 145,
            height: 48,
        },
        descriptionView: {
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            flex: 1,
            width: 185
        }

    })
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={props.onPress}
                style={styles.opacity}

            >
                <View style={styles.header}>
                    <Image source={{uri: props.circleEvent.image}} style={styles.eventImage} />
                    <View style={styles.floating}>
                        <Text style={styles.titleText}>{props.circleEvent.name}</Text>
                        <Text style={styles.timeText}>{new Date(props.circleEvent.startDate as unknown as string).toDateString()}</Text>
                    </View>
                    <View style={styles.descriptionView}>
                        <Text style={styles.descriptionText}>{props.circleEvent.description}</Text>
                    </View>
                    

                </View>

            </TouchableOpacity>
        </View>
    );
}

export const CircleTouchable = (props:{circleProps: CircleListItem, onPress:((circleProp:CircleListItem) => void)}):JSX.Element => {
    const styles = StyleSheet.create({
        opacity: {
            width: 250,
            height: 100,
            borderRadius: 10,

        },
        header: {
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
            backgroundColor: COLORS.white,
            width: 250,
            height: 65,
            borderRadius: 15,

        },
        column: {
            flexDirection: "column",
            width: 200,
            height: 55,
        },
        circleNameText: {
            ...theme.title,
            fontSize: 20,
            textAlign: "center"
        },
        circleImage: {
            height: 50,
            width: 50,
            borderRadius: 40,
            alignSelf: "center"
        },
    });
    return (
        <View>
            <TouchableOpacity
                onPress={() => props.onPress(props.circleProps)}
                style={styles.opacity}
            >
                <View style={styles.header}>
                    {props.circleProps.image !== "" &&
                        <Image source={{uri: props.circleProps.image}} style={styles.circleImage}></Image>
                    }
                    <View style={styles.column}>
                        <Text style={styles.circleNameText}>{props.circleProps.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const AnnouncementTouchable = (props:{announcementProps: CircleAnnouncementListItem}):JSX.Element => {
    const styles = StyleSheet.create({
        container: {
            width: 140,
            height: 60,
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
        },
        bubbleStyle: {
            backgroundColor: COLORS.primary,
            width: 175,
            height: 80,
            borderRadius: 15,
            justifyContent: "center",
            alignContent: "center",
            marginHorizontal: 5
        },
        titleText: {
            ...theme.primary,
            color: COLORS.white,
            fontWeight: "700"
        },
        bodyText: {
            ...theme.text,
            fontSize: FONT_SIZES.S,
            
        }
    });

    return (
        <View>
            <TouchableOpacity style={styles.bubbleStyle}>
                <View style={styles.container}>
                    <Text style={styles.titleText}>{new Date(props.announcementProps.startDate as unknown as string).toDateString()}</Text>
                    <Text style={styles.bodyText}>{props.announcementProps.message}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const PrayerRequestTouchable = (props:{prayerRequestProps:PrayerRequestListItem}):JSX.Element => {
    const styles = StyleSheet.create({
        container: {
            marginTop: 2,
            marginLeft: 10
        },
        opacity: {
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            width: 200,
            height: 60,
            marginTop: 10
        },
        nameText: {
            ...theme.header,
            fontSize: 18,
        },
        bodyText: {
            ...theme.text,
            fontSize: FONT_SIZES.S,
            color: COLORS.white
        }
    });

    return (
        <View>
            <TouchableOpacity style={styles.opacity}>
                <View style={styles.container}>
                    <Text style={styles.nameText}>{props.prayerRequestProps.requestorProfile.displayName}</Text>
                    <Text style={styles.bodyText}>{props.prayerRequestProps.topic}</Text>
                </View>
            </TouchableOpacity>
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
            justifyContent: "space-evenly",
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
                    <Ionicons
                        name="home"
                        color={(isFocused["Circles"] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Prayer")}
                >
                    <Ionicons
                        name="accessibility"
                        color={(isFocused["Prayer"] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Learn")}
                >
                    <Ionicons
                        name="library"
                        color={(isFocused["Learn"] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab("Profile")}
                >
                    <Ionicons
                        name="person-circle"
                        color={(isFocused["Profile"] && COLORS.primary) || COLORS.grayDark}
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