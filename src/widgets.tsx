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
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAME, BOTTON_TAB_NAVIGATOR_ROUTE_NAMES, CIRCLE_NAVIGATOR_ROUTE_NAME, FormDataType, FormInputProps, FormSubmit, PRAYER_REQUEST_LIST_ROUTE_NAME, PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, PrayerRequestRecipientViewMode, PrayerRequestListViewMode, TabNavigationProps } from './TypesAndInterfaces/custom-types';
import theme, { COLORS, FONTS, FONT_SIZES, RADIUS } from './theme';
import { useAppDispatch, useAppSelector } from "./TypesAndInterfaces/hooks";
import { RootState } from './redux-store';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { InputType, InputSelectionField, isListType } from './TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import { SelectListItem } from './TypesAndInterfaces/custom-types';
import { PrayerRequestTagEnum } from './TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';



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

export const CircleTouchable = (props:{circleProps: CircleListItem, onPress:(() => void)}):JSX.Element => {
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
                onPress={props.onPress}
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

export const PrayerRequestTouchable = (props:{prayerRequestProp:PrayerRequestListItem, onPress:(() => void)}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    
    const [prayerCount, setPrayerCount] = useState(props.prayerRequestProp.prayerCount);
    const [hasPrayed, setHasPrayed] = useState(false); // Because the server doesn't have a dislike route, and there is no limit on how many times the same user likes, prevent the user from sending a like request when they have previously liked the PR

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const renderTags = ():JSX.Element[] => 
        (props.prayerRequestProp.tagList || []).map((tag:PrayerRequestTagEnum, index:number) => 
            <Text style={styles.tagsText} key={index}>{tag}</Text>
        );
    
    const onLikePress = async () => {
        if (!hasPrayed) {
            await axios.post(`${DOMAIN}/api/prayer-request/` + props.prayerRequestProp.prayerRequestID + '/like', {}, RequestAccountHeader).then((response) => {
                setPrayerCount(prayerCount+1);
                setHasPrayed(true);
            }).catch((error:AxiosError) => console.log(error));
        }
    }

    const styles = StyleSheet.create({
        container: {
            marginTop: 5,
            marginLeft: 8
        },
        opacity: {
            borderRadius: 5,
            backgroundColor: COLORS.grayDark,
            width: 290,
            height: 80,
            marginTop: 10
        },
        nameText: {
            ...theme.header,
            fontSize: 20,
        },
        bodyText: {
            ...theme.text,
            fontSize: FONT_SIZES.S + 2,
            color: COLORS.white
        },
        prayerRequestDataTopView: {
            marginTop: 2,
            flexDirection: "row",
        },
        middleData: {
            flexDirection: "column",
            marginLeft: 10,
        },
        socialDataView: {
            backgroundColor: COLORS.primary,
            borderRadius: 5,
            //justifyContent: "center",
            position: "absolute",
            right: 2,
            //bottom: 2,
            //alignSelf: "center",
            flexDirection: "row",
            flex: 1
        },
        prayerCountText: {
            ...theme.text,
            color: COLORS.white,
            textAlign: "center",
            fontSize: 15
        },
        prayerCountIncreaseText: {
            ...theme.text,
            color: COLORS.white,
            textAlign: "center",
            fontSize: 12
        },
        tagsView: {
            backgroundColor: COLORS.grayDark,
            position: "absolute",
            bottom: 2,
            left: 2,
            flexDirection: "row",
           
        },
        tagsText: {
            ...theme.text,
            fontStyle: "italic",
            marginHorizontal: 2,
            fontSize: 12
        }

    });

    return (
        <View>
            <TouchableOpacity style={styles.opacity} onPress={props.onPress}>
                <View style={styles.container}>
                    <View style={styles.prayerRequestDataTopView}>
                        <RequestorProfileImage imageUri={props.prayerRequestProp.requestorProfile.image} userID={props.prayerRequestProp.requestorProfile.userID} style={{height: 50, width: 50}}/>
                        <View style={styles.middleData}>
                            <Text style={styles.nameText}>{props.prayerRequestProp.requestorProfile.displayName}</Text>
                            <Text style={styles.bodyText}>{props.prayerRequestProp.topic}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={onLikePress}>
                    <View style={styles.socialDataView}>
                        <Text style={styles.prayerCountText}>{prayerCount} Prayed</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.tagsView}>
                    {renderTags()}
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const CircleTabNavigator = (props:BottomTabBarProps):JSX.Element => {

    // Because I can't refer to the value of other objects in a static object declaration, generate the object dynamically
    const generateDefaultNavigationState = () => {
        var defaultNavigationState:Record<string, boolean> = {};
        BOTTON_TAB_NAVIGATOR_ROUTE_NAMES.forEach((route) => {
            defaultNavigationState[route] = false;
        })
        return defaultNavigationState;
    }

    const defaultNavigationState:Record<string, boolean> = generateDefaultNavigationState();
    const [isFocused, setIsFocused] = useState<Record<string, boolean>>(defaultNavigationState);

    const changeTab = (screenName:string) => {
        var newState = {...defaultNavigationState};
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
   
    useEffect(() => {
        var newState = {...defaultNavigationState};
        newState[CIRCLE_NAVIGATOR_ROUTE_NAME] = true;
        setIsFocused(newState);
    }, [])

    return (
        <View style={styes.container}>
            <View style={styes.padding}>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(CIRCLE_NAVIGATOR_ROUTE_NAME)}
                >
                    
                    <Ionicons
                        name="home"
                        color={(isFocused[CIRCLE_NAVIGATOR_ROUTE_NAME] && COLORS.primary) || COLORS.grayDark}
                        size={55}
                    />
                        
                </TouchableOpacity>
                <TouchableOpacity
                    style={styes.navTouchable}
                    onPress={() => changeTab(PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME)}
                >
                    <Ionicons
                        name="accessibility"
                        color={(isFocused[PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME] && COLORS.primary) || COLORS.grayDark}
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

export const FormInput = forwardRef<FormSubmit, FormInputProps>((props, ref):JSX.Element => {

    // Determine if the field value is a string or a list by defining a type guard
    // documentation: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing
    const fieldValueIsString = (fieldType: InputType, value: string | string[]): value is string => {
        return !isListType(fieldType);
    }

    const createFormValues = ():Record<string, string | string[]> => {
        const formValues: Record<string, string | string> = {};
        props.fields.forEach((field:InputField) => {
            if (!fieldValueIsString(field.type, field.value || "")) 
                if (field instanceof InputSelectionField || InputType.CIRCLE_ID_LIST || InputType.USER_ID_LIST) {
                    //@ts-ignore
                    formValues[field.field] = (props.defaultValues !== undefined) ? props.defaultValues[field.field] : field.selectOptionList || [];
                }
                else {
                    //@ts-ignore
                    formValues[field.field] = (props.defaultValues !== undefined) ? props.defaultValues[field.field] : field.value || "";
                }
            else 
                //@ts-ignore
                formValues[field.field] = (props.defaultValues !== undefined) ? props.defaultValues[field.field] : field.value || "";
        });
        console.log(formValues);
        return formValues;
   }

   const {
        control,
        handleSubmit,
        formState: { errors },
        clearErrors,
      } = useForm({
        defaultValues: createFormValues()
    }); 

    useImperativeHandle(ref, () => ({
        onHandleSubmit() {
            handleSubmit(props.onSubmit)();
        }
    }))

    const styles = StyleSheet.create({
        ...theme
    })

    return (
        <ScrollView>{
            (props.fields).map((field:InputField, index:number) => {
                switch(field.type) {
                case InputType.TEXT || InputType.NUMBER:
                    return (
                    <Controller 
                        control={control}
                        rules={{
                        required: field.required,
                        pattern: field.validationRegex
                        }}
                        render={({ field: {onChange, onBlur, value}}) => (
                            <>
                            {
                                (fieldValueIsString(field.type, value)) && <Input_Field 
                                    placeholder={field.title}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType={(field.type === InputType.NUMBER && "numeric") || "default"}
                                    validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                />
                            }
                            
                            </>
   
                        )}
                        name={field.field}
                        key={field.field}
                    />
                    );
                    break;
                case InputType.PASSWORD:
                    return (
                    <Controller 
                        control={control}
                        rules={{
                        required: field.required,
                        pattern: field.validationRegex,
                        validate: (value, formValues) => {
                            if (field.field === "passwordVerify") {
                            if (value == formValues["password"]) return true;
                            else return false;
                            }
                            else {
                            return true;
                            }
                        }
                        
                        }}
                        render={({ field: {onChange, onBlur, value}}) => (
                            <>
                                {fieldValueIsString(field.type, value) && <Input_Field 
                                    placeholder={field.title}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType='default'
                                    textContentType='password'
                                    validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                />}
                            </>
                        
                        )}
                        name={field.field}
                        key={field.field}
                    />
                    );
                    break;
                case InputType.EMAIL:
                    return (
                    <Controller 
                        control={control}
                        rules={{
                        required: field.required,
                        pattern: field.validationRegex,
                        validate: async (value, formValues) => {
                            var responseStatus = false;
                            if (fieldValueIsString(field.type, value)) {
                                if (value.match(field.validationRegex)) {
                                    // check server to see if account with that email address exists
                                        if (field.unique) {
                                            await axios.get(`${DOMAIN}/resources/available-account?email=` + value).then((response) => {
                                                responseStatus = true;
                                                if (response.status == 204) return true;
                                            
                                                }).catch(err => console.log("err", err));
                
                                                // if the axios request returned an error, return validation failure
                                                if (!responseStatus) return false;
                                        }
                                        else return true;
                                    } 
                                    else return false;
                            }
                        }
                        
                        }}
                        render={({ field: {onChange, onBlur, value}}) => (
                        <>
                            {fieldValueIsString(field.type, value) &&                         
                                <Input_Field 
                                    placeholder={field.title}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType='email-address'
                                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                                    inputStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                                    validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                />}
                        </>

                        )}
                        name={field.field}
                        key={field.field}
                    />
                    );
                    break;
                case InputType.SELECT_LIST:
                    if (field instanceof InputSelectionField) {
                        var selectListData:SelectListItem[] = [];
                        for (var i=0; i<field.selectOptionList.length; i++) {
                            selectListData.push({key: i, value: field.selectOptionList[i]})
                        }

                        const getSelectListDefaultValue = (selectListValue:string | undefined) => {
                            if (selectListValue !== undefined) {
                                for (var i=0; i<selectListData.length; i++) {
                                    if (selectListData[i].value == selectListValue) return selectListData[i];
                                }
                            }
                            return undefined;
                        }

                        return (
                            <Controller 
                                control={control}
                                rules={{
                                required: field.required,
                                }}
                                render={({ field: {onChange, onBlur, value}}) => (
                                <>
                                    {fieldValueIsString(field.type, value) &&                                
                                    <Dropdown_Select
                                        setSelected={(val:string) => onChange(val)}
                                        data={selectListData}
                                        placeholder={field.title}
                                        validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                        validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                        boxStyle={(errors[field.field] && {borderColor: COLORS.primary}) || {borderColor: COLORS.accent}}
                                        defaultOption={getSelectListDefaultValue(value)}
                                    />} 
                                </>
 
                                )}
                                name={field.field}
                                key={field.field}
                            />
                        );
                    }
                    else return (<></>)
                    break;
                case InputType.DATE:
                    const minAge:Date = getDOBMaxDate(RoleEnum.STUDENT)
                    const maxAge:Date = getDOBMinDate(RoleEnum.STUDENT);
                    return (
                    <Controller 
                        control={control}
                        rules={{
                        required: field.required,
                        validate: (value, formValues) => {
                            if (fieldValueIsString(field.type, value)) {
                                const currAge = new Date(value);
                                console.log(minAge, maxAge, currAge);
                                if (currAge > minAge || currAge < maxAge) return false;
                                else return true;
                            }
                        }
                        }}
                        render={({ field: {onChange, onBlur, value}}) => (
                        <>
                            {fieldValueIsString(field.type, value) &&                         
                                <DatePicker 
                                buttonText={field.title}
                                buttonStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                                onConfirm={(date:Date) => onChange(date.toISOString())}
                                validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                defaultDate={value}
                            />}
                        </>

                        )}
                        name={field.field}
                        key={field.field}
                    />
                    );
                    break;
                    
                case InputType.MULTI_SELECTION_LIST || InputType.CUSTOM_STRING_LIST:
                    if (field instanceof InputSelectionField) {
                        var selectListData:SelectListItem[] = [];
                        for (var i=0; i<field.selectOptionList.length; i++) {
                            selectListData.push({key: i, value: field.selectOptionList[i]})
                        }

                        const getSelectListDefaultValue = (selectListValues:string[] | undefined) => {
                            var selected:SelectListItem[] = [];
                            if (selectListValues !== undefined) {
                                selectListValues.forEach((value:string) => {
                                    for (var i=0; i<selectListData.length; i++) {
                                        if (selectListData[i].value == value) {
                                            selected.push(selectListData[i]);
                                            break;
                                        }
                                    }
                                });
                                return selected;
                            }
                            return undefined;
                        }

                        return (
                            <Controller 
                                control={control}
                                rules={{
                                required: field.required,
                                }}
                                render={({ field: {onChange, onBlur, value}}) => (
                                <>
                                    {!fieldValueIsString(field.type, value) &&                                
                                    <Multi_Dropdown_Select
                                        setSelected={(val:string) => onChange(val)}
                                        data={selectListData}
                                        placeholder={field.title}
                                        validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                        validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                        boxStyle={(errors[field.field] && {borderColor: COLORS.primary}) || {borderColor: COLORS.accent}}
                                        defaultOption={getSelectListDefaultValue(value)}
                                    />} 
                                </>
 
                                )}
                                name={field.field}
                                key={field.field}
                            />
                        );
                    }
                    else return (<></>)
                    break;
                case InputType.PARAGRAPH:
                    break;
                // Default case will likely never happen, but its here to prevent undefined behavior per TS
                default:
                    return <></>
                }

            })
        }
    </ScrollView>)
});

export const ProfileImage = (props:{style?:ImageStyle, src?:string}):JSX.Element => {
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

export const RequestorProfileImage = (props:{style?:ImageStyle, imageUri?:string, userID?:number}):JSX.Element => {
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfileImage = useAppSelector((state: RootState) => state.account.userProfile.image);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const DEFAULT_PROFILE_ICON = require("../assets/profile-icon-blue.png");

    const [requestorImage, setRequestorImage] = useState<ImageSourcePropType>(DEFAULT_PROFILE_ICON);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const styles = StyleSheet.create({
        profileImage: {
            height: 100,
            width: 100,
            borderRadius: 15,
            alignSelf: "center",
            ...props.style
        },
    })

    const fetchProfileImage = async () => {
        await axios.get(`${DOMAIN}/api/user/` + props.userID + '/image', RequestAccountHeader).then(response => {
            setRequestorImage({uri: response.data})
        }).catch((error:AxiosError) => {console.log(error)})
    }

    useEffect(() => {
        if (props.imageUri !== undefined) setRequestorImage({uri: props.imageUri})
        else if (props.userID !== undefined) {
            if (props.userID == userID) setRequestorImage({uri: userProfileImage})
            else fetchProfileImage();
        }
    },[])
    return <Image source={requestorImage} style={styles.profileImage}></Image> 
}


export const RequestorCircleImage = (props:{style?:ImageStyle, imageUri?:string, circleID?:number}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const DEFAULT_PROFILE_ICON = require("../assets/profile-icon-blue.png");
    const [requestorImage, setRequestorImage] = useState<ImageSourcePropType>(DEFAULT_PROFILE_ICON);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }
    const styles = StyleSheet.create({
        circleImage: {
            height: 100,
            width: 100,
            borderRadius: 15,
            alignSelf: "center",
            ...props.style
        },
    })

    const fetchProfileImage = async () => {
        await axios.get(`${DOMAIN}/api/user/` + props.circleID + '/image', RequestAccountHeader).then(response => {
            setRequestorImage({uri: response.data})
        }).catch((error:AxiosError) => {console.log(error)})
    }

    useEffect(() => {
        if (props.imageUri !== undefined) setRequestorImage({uri: props.imageUri})
        else if (props.circleID !== undefined) fetchProfileImage();
    }, [])

    return <Image source={requestorImage} style={styles.circleImage}></Image> 
}