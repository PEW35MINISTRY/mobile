import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ColorValue, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, KeyboardTypeOptions, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle, ScrollView, SafeAreaView, Keyboard } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme, { COLORS, FONT_SIZES, RADIUS } from './theme';
import { useAppDispatch, useAppSelector } from "./TypesAndInterfaces/hooks";
import { RootState } from './redux-store';
import { MultipleSelectList, SelectList, SelectListItem } from 'react-native-dropdown-select-list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ToastQueueManager from './utilities/ToastQueueManager';
import { ServerErrorResponse } from './TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import { makeDisplayText } from './utilities/utilities';
import formatRelativeDate from './utilities/dateFormat';
import Slider from '@react-native-community/slider';
import Toast from 'react-native-toast-message';

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
                 <Text allowFontScaling={false} style={styles.textStyle}>{props.text}</Text>
             </TouchableOpacity> );
}

export const CheckBox = (props:{ label?: string, labelStyle?: object, iconColor?: string, onChange: (value:boolean) => void, initialState?:boolean}):JSX.Element => {
    
    const [checked, setChecked] = useState<boolean>(props.initialState === undefined ? false : props.initialState);
    
    const onChange = () => {
        setChecked(!checked);
        props.onChange(!checked);
    }

    const styles = StyleSheet.create({
        checkBox: {
          width: 25,
          height: 25,
          borderWidth: 1,
          borderColor: '#000',
          justifyContent: "center",
          alignItems: "center"
        },
        wrapperCheckBox: {
          flexDirection: "row",
          alignItems: "center",
        },
        labelCheck: {
          color: '#fff',
          marginLeft: 6,
          marginRight: 15
        }
      })
    
      return (
        <View style={styles.wrapperCheckBox}>
          <Text allowFontScaling={false} style={[styles.labelCheck, props.labelStyle]}>
            {props.label}
          </Text>
          <TouchableOpacity onPress={onChange} style={[
            styles.checkBox, {borderColor: COLORS.white}
          ]}>
            {
              checked ? <Ionicons name="checkmark-outline"
                color={COLORS.white}
                size={30}
              /> : null
            }
          </TouchableOpacity>

        </View>
      );
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
                <Text allowFontScaling={false} style={styles.textStyle}>{props.title}</Text>
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
                        <Text allowFontScaling={false} style={(index === selectedIndex) ? [styles.text, styles.filterSelected] 
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
            maxHeight: 150
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
                {props.label && <Text allowFontScaling={false} style={styles.labelStyle}>{props.label}</Text>}
                <TextInput
                    allowFontScaling={false}
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
                    returnKeyType='done'
                    blurOnSubmit={true}
                />
                {props.validationLabel && <Text allowFontScaling={false} style={styles.validationStyle}>{props.validationLabel}</Text>}
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
                <View pointerEvents='none'>
                    <Input_Field 
                        label={props.label}
                        value={formatRelativeDate(props.date)}
                        editable={false}
                        onChangeText={() => null}
                        validationLabel={props.validationLabel}
                        validationStyle={props.validationStyle}
                        labelStyle={(props.validationLabel && {color: COLORS.primary}) || undefined}
                        inputStyle={(props.validationLabel && {borderColor: COLORS.primary}) || undefined}
                        containerStyle={{alignSelf: "center"}}
                    />
                </View>
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

export const Dropdown_Select = (props:{validationLabel?:string, saveKey?:boolean, label?:string, setSelected:((val:string) => void), selectOptionsList: SelectListItem[], displayOptionsList?:String[], displaySelectOptions?:SelectListItem[], placeholder?:string, boxStyle?:ViewStyle, validationStyle?:TextStyle, labelStyle?:TextStyle, defaultOption?:SelectListItem }):JSX.Element => {
    
    const selectOptionsDataKeys = useState<any[]>(props.selectOptionsList.map((selectListItem) => selectListItem.key));
    const selectOptionsDataValues = useState<any[]>(props.selectOptionsList.map((selectListItem) => selectListItem.value));

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
            {props.label && <Text allowFontScaling={false} style={styles.labelStyle}>{props.label}</Text>}
            <SelectList 
                setSelected={(val: string) => props.displayOptionsList !== undefined ? props.saveKey ? selectOptionsDataKeys[props.displayOptionsList.indexOf(val)] : selectOptionsDataValues[props.displayOptionsList.indexOf(val)] : props.setSelected(val)}
                data={props.displaySelectOptions !== undefined ? props.displaySelectOptions : props.selectOptionsList}
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
            {props.validationLabel && <Text allowFontScaling={false} style={styles.errorTextStyle}>{props.validationLabel}</Text>}

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
            {props.label && <Text allowFontScaling={false} style={styles.labelStyle}>{props.label}</Text>}
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
            {props.validationLabel && <Text allowFontScaling={false} style={styles.errorTextStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}

export const SelectSlider = (props:{minValue:number, maxValue:number, defaultValue: number, maxField?:string, onValueChange:((val:string) => void), label?:string, validationLabel?:string, labelStyle?:TextStyle, validationStyle?:TextStyle}):JSX.Element => {

    const [sliderValue, setSliderValue] = useState<number>(isNaN(props.defaultValue) ? props.minValue : props.defaultValue);

    const onSliderValueChange = (value:number) => {
        setSliderValue(value);
        props.onValueChange(value.toString())
    }

    const styles = StyleSheet.create({
        dropdownText: {
            color: COLORS.white,
            textAlign: "center"
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
            {props.label && <Text allowFontScaling={false} style={styles.labelStyle}>{props.label}</Text>}
            <Text allowFontScaling={false} style={styles.sliderValueText}>{sliderValue}</Text>
            <Slider 
                minimumValue={props.minValue}
                maximumValue={props.maxValue}
                value={props.defaultValue}
                onValueChange={onSliderValueChange}
                step={1}
                thumbTintColor={COLORS.accent}
                minimumTrackTintColor={COLORS.accent}
                maximumTrackTintColor={COLORS.accent}
            />
            {props.validationLabel && <Text allowFontScaling={false} style={styles.errorTextStyle}>{props.validationLabel}</Text>}
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

    useEffect(() => {
        setRequestorImage(userProfileImage === undefined ? DEFAULT_PROFILE_ICON : {uri: userProfileImage});
    }, [userProfileImage])

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

export const EditButton = (props:{callback?:(() => void), navigation?:NativeStackNavigationProp<any, string, undefined>, buttonView?:ViewStyle}) => {
    const styles = StyleSheet.create({
        editButtonView: {
            position: "absolute",
            top: 1,
            right: 1,
            ...props.buttonView
        },
        editButton: {
            justifyContent: "center",
            alignItems: "center",
            height: 55,
            width: 55,
            borderRadius: 15,
        }
    })
    
    return (
        <SafeAreaView style={styles.editButtonView}>
            <TouchableOpacity 
                onPress={() => { 
                    if(props.navigation) props.navigation.goBack();
                    else if(props.callback) props.callback();
                }}
            >
                <View style={styles.editButton}>
                    <Ionicons 
                        name="pencil-outline"
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

export const DeleteButton = (props:{callback:(() => void),  buttonView?:ViewStyle}):JSX.Element => {
    const styles = StyleSheet.create({
        deleteButton: {
            justifyContent: "center",
            alignItems: "center",
            height: 55,
            width: 55,
            borderRadius: 15,
          },
          deleteButtonView: {
            position: "absolute",
            top: 1,
            right: 1,
            ...props.buttonView
          },
    })

    return (
        <SafeAreaView style={styles.deleteButtonView}>
            <TouchableOpacity
                onPress={() => props.callback()}
            >
                <View style={styles.deleteButton}>
                <Ionicons 
                    name="trash-outline"
                    color={COLORS.white}
                    size={30}
                />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export const Filler = (props:{fillerStyle:ViewStyle}):JSX.Element => {

    const styles = StyleSheet.create({
        fillerView: {
            ...props.fillerStyle
        }
    })

    return (
        <SafeAreaView style={styles.fillerView} />
    )
} 

export const Confirmation = (props:{callback:(() => void), onCancel:(() => void), promptText:string, buttonText:string}):JSX.Element => {
    const styles = StyleSheet.create({
        deleteView: {
            backgroundColor: COLORS.black,
            height: '40%',
            marginTop: 'auto',
        },
        confirmDeleteText: {
            ...theme.title,
            alignSelf: "center",
            textAlign: "center",
            maxWidth: '90%'
        },
        buttons: {
            maxWidth: '70%',
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center"
        },    
        sign_in_button: {
            marginVertical: 28,
        },
    })
    
    return (
        <SafeAreaView style={styles.deleteView}>
            <Text allowFontScaling={false} style={styles.confirmDeleteText}>Are you sure you want to {props.promptText}?</Text>
            <View style={styles.buttons}>
                <Raised_Button buttonStyle={styles.sign_in_button}
                    text={props.buttonText}
                    onPress={() => props.callback()}
                />
                <Outline_Button 
                    text="Cancel"
                    onPress={() => props.onCancel()}
                />
            </View>
            <Toast />
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
            {(count > 0) && <Text allowFontScaling={false} style={styles.likeCountText}>{count}</Text>}
        </View>
      </TouchableOpacity>
    )
}
