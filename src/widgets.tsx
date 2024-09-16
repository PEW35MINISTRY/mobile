import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ColorValue, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, KeyboardTypeOptions, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle, ScrollView, SafeAreaView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme, { COLORS, FONT_SIZES, RADIUS } from './theme';
import { useAppDispatch, useAppSelector } from "./TypesAndInterfaces/hooks";
import { RootState } from './redux-store';
import { MultipleSelectList, SelectList, SelectListItem } from 'react-native-dropdown-select-list';
import { Slider } from '@react-native-assets/slider'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ToastQueueManager from './utilities/ToastQueueManager';
import { ServerErrorResponse } from './TypesAndInterfaces/config-sync/api-type-sync/toast-types';
import { makeDisplayText } from './utilities/utilities';


/**************************************************
 * These are reusable widgets for app consistency *
 **************************************************/

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

//Not Header, Included in page scroll
export const Page_Title = (props:{title:string, containerStyle?:ViewStyle, textStyle?:TextStyle}):JSX.Element => {
    const styles = StyleSheet.create({
        containerStyle: {
            width: '100%',
            padding: theme.header.fontSize / 2,
            ...props.containerStyle
        },
        textStyle: {
            ...theme.header,
            textAlign: 'center',
            ...props.textStyle
        }
    });

    return ( <View style={styles.containerStyle}>
                <Text style={styles.textStyle}>{props.title}</Text>
            </View> );
}


/* Horizontal Multi Tab Selector */
export const Tab_Selector = (props:{optionList:string[], defaultIndex:number|undefined, onSelect:(name:string, index:number) => void, onDeselect?:() => void, containerStyle?:ViewStyle, textStyle?:TextStyle }) => {

    const [selectedIndex, setSelectedIndex] = useState<number|undefined>(props.defaultIndex);

    const styles = StyleSheet.create({
        filterContainer: {
            flexDirection: 'row',
            padding: 0,

            borderWidth: 1,
            borderColor: COLORS.grayDark,
            borderRadius: (props.textStyle?.fontSize ?? theme.text.fontSize) / 2,
            overflow: 'hidden',

            ...props.containerStyle,
          },
          filterSelected: {
            paddingVertical: 1,
            paddingHorizontal: 10,
            backgroundColor: (props.textStyle?.color) ? props.textStyle.color : COLORS.accent,
          },
          filterNotSelected: {
            paddingVertical: 1,
            paddingHorizontal: 10,
            color: COLORS.grayDark
          },
          divider: {
            width: 1,
            backgroundColor: COLORS.grayDark,
            marginVertical: 5,
          },
          text: {
            ...theme.text,
            ...props.textStyle,
            color: (props.textStyle?.color === COLORS.white) ? COLORS.accent : COLORS.white
          }
        });

    return (
        <View style={styles.filterContainer}>
            {[...props.optionList].map((item:string, index:number) => (
                <React.Fragment key={`${item}-${index}`}>
                    <TouchableOpacity onPress={() => {
                        if(selectedIndex !== index) {
                            setSelectedIndex(index);
                            props.onSelect(item, index);
                        } else if(props.onDeselect) {
                            setSelectedIndex(undefined);
                            props.onDeselect();
                        }
                        }} >
                        <Text style={(index === selectedIndex) ? [styles.text, styles.filterSelected] 
                            : [styles.text, styles.filterNotSelected] }>{makeDisplayText(item)}</Text>
                    </TouchableOpacity>
                    {index < props.optionList.length - 1 && <View style={styles.divider} />}
                </React.Fragment>                        
            ))}
        </View>
    );
}


export const Input_Field = (props:{label?:string|JSX.Element, inputStyle?:TextStyle, labelStyle?:TextStyle, containerStyle?:ViewStyle,
    value:string, onChangeText:((text: string) => void), placeholder?:string, placeholderTextColor?:ColorValue, keyboardType?:KeyboardTypeOptions,
    textContentType?:any, validationLabel?:string, validationStyle?:TextStyle, editable?:boolean, multiline?:boolean, autoCapitalize?:boolean}):JSX.Element => {  

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
                    editable={props.editable}
                    multiline={props.multiline}
                    textAlignVertical='top'
                    autoCapitalize={props.autoCapitalize === false ? "none" : "sentences"}
                />
                {props.validationLabel && <Text style={styles.validationStyle}>{props.validationLabel}</Text>}
            </View> );
}

export const Icon_Button = (props:{source:ImageSourcePropType, imageStyle:ImageStyle, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {
    return ( <TouchableOpacity onPress={props.onPress}>
                 <Image source={props.source} style={props.imageStyle} />
             </TouchableOpacity> );
}

export const DatePicker = (props:{validationLabel?:string, buttonStyle?:ViewStyle, buttonText:string, onConfirm:((date:Date) => void), validationStyle?:TextStyle, date:string, labelStyle?:TextStyle, label?:string }):JSX.Element => {
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
        },
        buttonStyle: {

        },
        labelStyle: {
            ...theme.accent,
            color: COLORS.transparentWhite,
            textAlign: 'left',
            ...props.labelStyle,
        },
    });

    return (
        <View style={styles.containerStyle}>

            <TouchableOpacity
                onPress={(event:GestureResponderEvent) => setDatePickerVisible(true)}
            >
                <Input_Field 
                    label={props.label}
                    value={new Date(props.date).toLocaleDateString('en-us', { month: 'long' })}
                    editable={false}
                    onChangeText={() => null}
                    validationLabel={props.validationLabel}
                    validationStyle={props.validationStyle}
                    labelStyle={(props.validationLabel && {color: COLORS.primary}) || undefined}
                    inputStyle={(props.validationLabel && {borderColor: COLORS.primary}) || undefined}
                    containerStyle={{alignSelf: "center"}}
                />
            </TouchableOpacity>
            <DateTimePickerModal 
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date:Date) => {props.onConfirm(date); setDatePickerVisible(false)}}
                onCancel={(event:Date) => setDatePickerVisible(false)}
                date={new Date(props.date)}
            />
        </View>
    )
}

export const Dropdown_Select = (props:{validationLabel?:string, saveKey?:boolean, label?:string, setSelected:((val:string) => void), data: SelectListItem[], placeholder?:string, boxStyle?:ViewStyle, validationStyle?:TextStyle, labelStyle?:TextStyle, defaultOption?:SelectListItem }):JSX.Element => {
    const styles = StyleSheet.create({
        dropdownText: {
            ...theme.text,
            textAlign: "center",
        },
        labelStyle: {
            ...theme.accent,
            color: COLORS.transparentWhite,
            textAlign: 'left',
            marginVertical: 5,
            ...props.labelStyle,
        },
        selectBoxStyle: {
            ...props.boxStyle,
            justifyContent: "center"
        },
        dropdownSelected: {
            ...theme.text,
            textAlign: "center",
            flex: 1,
            paddingLeft: 16
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
        dropdownIcon: {
            paddingTop: theme.text.fontSize / 2,
        }
    });
    
    return (
        <View style={styles.containerStyle} >
            {props.label && <Text style={styles.labelStyle}>{props.label}</Text>}
            <SelectList 
                setSelected={(val: string) => props.setSelected(val)}
                data={props.data}
                save={(props.saveKey !== undefined && props.saveKey == true) ? "key" : "value"}
                boxStyles={styles.selectBoxStyle} 
                dropdownTextStyles={styles.dropdownText}
                inputStyles={styles.dropdownSelected}
                placeholder={props.placeholder ?? props.defaultOption?.value}
                defaultOption={props.defaultOption} 
                search={false}
                arrowicon={
                    <Ionicons
                        name={'chevron-down'}
                        color={COLORS.accent}
                        size={theme.text.fontSize} 
                        style={styles.dropdownIcon}
                    />
                }
            />
            {props.validationLabel && <Text style={styles.errorTextStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}

export const Multi_Dropdown_Select = (props:{validationLabel?:string, setSelected:((val:string[]) => void), data: SelectListItem[], placeholder?:string, boxStyle?:ViewStyle, validationStyle?:TextStyle, defaultOptions?:SelectListItem[], label?:string, labelStyle?:TextStyle, checkBoxStyles?: ViewStyle}):JSX.Element => {

    const styles = StyleSheet.create({
        dropdownText: {
            ...theme.text,
            textAlign: "center",
            
        },
        labelStyle: {
            ...theme.accent,
            color: COLORS.transparentWhite,
            textAlign: 'left',
            marginVertical: 5,
            ...props.labelStyle,
        },
        dropdownSelected: {
            ...theme.text,
            textAlign: "center",
            paddingLeft: 16,
            flex: 1 
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
        dropdownIcon: {
            paddingTop: theme.text.fontSize / 2,
        }
    });
    
    return (
        <View style={styles.containerStyle}>
            {props.label && <Text style={styles.labelStyle}>{props.label}</Text>}
            <MultipleSelectList 
                setSelected={(val: string[]) => props.setSelected(val)}
                data={props.data}
                save="value"
                boxStyles={props.boxStyle} 
                dropdownTextStyles={styles.dropdownText}
                inputStyles={styles.dropdownSelected}
                placeholder={props.placeholder}
                defaultOptions={props.defaultOptions}
                checkBoxStyles={props.checkBoxStyles}
                search={false}
                arrowicon={
                    <Ionicons
                        name={'chevron-down'}
                        color={COLORS.accent}
                        size={theme.text.fontSize} 
                        style={styles.dropdownIcon}
                    />
                }
             />
            {props.validationLabel && <Text style={styles.errorTextStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}

export const SelectSlider = (props:{minValue:number, maxValue:number, defaultValue: number, maxField?:string, onValueChange:((val:string) => void), label?:string, validationLabel?:string, labelStyle?:TextStyle, validationStyle?:TextStyle}):JSX.Element => {

    const [sliderValue, setSliderValue] = useState<number>(props.defaultValue);

    const onSliderValueChange = (value:number) => {
        setSliderValue(value);
        props.onValueChange(value.toString())
    }

    const styles = StyleSheet.create({
        dropdownText: {
            color: COLORS.white,
            textAlign: "center",
            
        },
        labelStyle: {
            ...theme.accent,
            color: COLORS.transparentWhite,
            textAlign: 'left',
            marginVertical: 5,
            ...props.labelStyle,
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
        sliderValueText: {
            ...theme.text,
            fontSize: FONT_SIZES.L,
            textAlign: "center"
        }
          
    });

    return (
        <View style={styles.containerStyle}>
            {props.label && <Text style={styles.labelStyle}>{props.label}</Text>}
            <Text style={styles.sliderValueText}>{sliderValue}</Text>
            <Slider 
                minimumValue={props.minValue}
                maximumValue={props.maxValue}
                value={props.defaultValue}
                onValueChange={onSliderValueChange}
                step={1}
                slideOnTap={true}
                thumbTintColor={COLORS.accent}
                minimumTrackTintColor={COLORS.accent}
                maximumTrackTintColor={COLORS.accent}
                trackStyle={{width: 200}}
            />
            {props.validationLabel && <Text style={styles.errorTextStyle}>{props.validationLabel}</Text>}
        </View>
    )
}

export const ProfileImage = (props:{style?:ImageStyle, onPress?:() => void}):JSX.Element => {
    const userProfileImage = useAppSelector((state: RootState) => state.account.userProfile.image);
    const DEFAULT_PROFILE_ICON = require("../assets/profile-icon-blue.png");

    const [requestorImage, setRequestorImage] = useState<ImageSourcePropType>(userProfileImage === undefined ? DEFAULT_PROFILE_ICON : {uri: userProfileImage});

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
        <TouchableOpacity onPress={() => props.onPress && props.onPress()}>
            <Image source={requestorImage} style={styles.profileImage}></Image>
        </TouchableOpacity>
    );
}

export const BackButton = (props:{callback?:(() => void), navigation?:NativeStackNavigationProp<any, string, undefined>, buttonView?:ViewStyle}):JSX.Element => {
    const styles = StyleSheet.create({
        backButton: {
            justifyContent: "center",
            alignItems: "center",
            height: 55,
            width: 55,
            borderRadius: 15,
          },
          backButtonView: {
            position: "absolute",
            top: 1,
            left: 1,
            ...props.buttonView
          },
    })

    return (
        <SafeAreaView style={styles.backButtonView}>
            <TouchableOpacity
                onPress={() => {
                    if(props.navigation) props.navigation.goBack();
                    else if(props.callback) props.callback();
                }}
            >
                <View style={styles.backButton}>
                <Ionicons 
                    name="return-up-back-outline"
                    color={COLORS.white}
                    size={30}
                />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export const XButton = (props:{callback?:(() => void), navigation?:NativeStackNavigationProp<any, string, undefined>, buttonView?:ViewStyle}):JSX.Element => {
    const styles = StyleSheet.create({
        xButton: {
            justifyContent: "center",
            alignItems: "center",
            height: 55,
            width: 55,
            borderRadius: 15,
          },
          xButtonView: {
            position: "absolute",
            top: 1,
            left: 1,
            ...props.buttonView
          },
    })

    return (
        <SafeAreaView style={styles.xButtonView}>
            <TouchableOpacity
                onPress={() => {
                    if(props.navigation) props.navigation.goBack();
                    else if(props.callback) props.callback();
                }}
            >
                <View style={styles.xButton}>
                <Ionicons 
                    name="close-outline"
                    color={COLORS.white}
                    size={30}
                />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export const IconCounter = (props:{initialCount:number, iconImage?:ImageSourcePropType, ionsIconsName?:string, postURL?:string, style?:ImageStyle}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const [count, setCount] = useState<number>(props.initialCount || 0);

    const onPress = async() => ((count === props.initialCount) && props.postURL) && //Limit to single increment
        await axios.post(props.postURL, {}, { headers: {jwt}})
            .then((response) => {ToastQueueManager.show({message: 'Saved'}); setCount(current => current + 1)})
            .catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));

    const styles = StyleSheet.create({
          likeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',

            paddingHorizontal: 5,
            height: theme.text.fontSize + 10,

            borderColor: COLORS.accent,
            borderWidth: 1,
            borderRadius: RADIUS,
        },
        likeCountText: {
            ...theme.text,
            color: COLORS.white,
            paddingHorizontal: 3,
        },
    })

    return (
        <TouchableOpacity onPress={onPress}>
        <View style={styles.likeContainer}>
            {props.iconImage ?
                <Image source={props.iconImage} style={{height: theme.text.fontSize, width: theme.text.fontSize}} />
                : <Ionicons 
                    name={props.ionsIconsName || 'thumbs-up-outline'}
                    color={COLORS.white}
                    size={theme.text.fontSize}
                />
            }
            {(count > 0) && <Text style={styles.likeCountText}>{count}</Text>}
        </View>
      </TouchableOpacity>
    )
}
