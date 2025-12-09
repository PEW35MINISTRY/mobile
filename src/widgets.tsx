import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { ColorValue, GestureResponderEvent, Image, ImageSourcePropType, ImageStyle, KeyboardTypeOptions, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle, ScrollView, SafeAreaView, Keyboard } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme, { COLORS, FONT_SIZES, RADIUS } from './theme';
import { useAppDispatch, useAppSelector } from "./TypesAndInterfaces/hooks";
import { RootState } from './redux-store';
import { MultipleSelectList, SelectList, SelectListItem } from 'react-native-dropdown-select-list';
import InputField, { InputRangeField, InputSelectionField, InputType } from './TypesAndInterfaces/config-sync/input-config-sync/inputField';
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

export const CheckBox = (props:{ label?: string, labelStyle?: object, checkboxStyle?:ViewStyle, iconColor?: string, onChange: (value:boolean) => void, initialState?:boolean}):JSX.Element => {
    
    const [checked, setChecked] = useState<boolean>(props.initialState === undefined ? false : props.initialState);
    const onChange = () => {
        setChecked(!checked);
        props.onChange(!checked);
    }

    const styles = StyleSheet.create({
        checkBox: {
          ...props.checkboxStyle,
          width: 25,
          height: 25,
          borderWidth: 1,
          borderColor: COLORS.white,
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
          <Text allowFontScaling={false} style={props.labelStyle ?? styles.labelCheck }>
            {props.label}
          </Text>
          <TouchableOpacity onPress={onChange} style={[
            styles.checkBox
          ]}>
            {
              checked ? <Ionicons name="checkmark-outline"
                color={COLORS.white}
                size={24}
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


export const Input_Field = (props:{field:InputField, labelStyle?:TextStyle, inputStyle?:TextStyle, validationLabel?:string, validationStyle?:TextStyle, containerStyle?:ViewStyle,
                                    value:string, onChangeText:((text: string) => void), editable?:boolean}):JSX.Element => {  

        
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
        validationRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: 4,
        },
        validationStyle: {
            ...theme.accent,
            flex: 1,
            color: COLORS.primary,
            textAlign: 'left',
            ...props.validationStyle,
        },
        lengthCounterStyle: {
            ...theme.text,
            fontSize: FONT_SIZES.S,
            color: COLORS.accent,
            textAlign: 'right',
            marginLeft: 'auto',
            flexShrink: 0,
        }
    });

    return ( <View style={styles.containerStyle}>
                <Text allowFontScaling={false} style={[styles.labelStyle, { color: props.validationLabel ? COLORS.primary : COLORS.transparentWhite }]}>
                    <Text style={{ color: props.validationLabel ? COLORS.primary : COLORS.accent }}>{props.field.required ? '* ' : '  '}</Text>{props.field.title}</Text>
                <TextInput
                    allowFontScaling={false}
                    blurOnSubmit={true}
                    style={styles.inputStyle}
                    onChangeText={props.onChangeText}
                    value={props.value}
                    keyboardType={(props.field.type === InputType.NUMBER) ? 'numeric'
                                    : (props.field.type === InputType.EMAIL) ? 'email-address' : 'default'}
                    textContentType={(props.field.type === InputType.PASSWORD ? 'password' : undefined)}
                    secureTextEntry={(props.field.type === InputType.PASSWORD)}
                    editable={props.editable}
                    multiline={(props.field.type === InputType.PARAGRAPH)}
                    textAlignVertical='top'
                    autoCapitalize='none'
                    returnKeyType='done'
                />
                <View style={styles.validationRow}>
                    {props.validationLabel &&
                        <Text allowFontScaling={false} style={styles.validationStyle}>{props.validationLabel}</Text>}

                    {(props.field.length) && 
                        <Text allowFontScaling={false} style={styles.lengthCounterStyle}>
                            {(() => {
                                const length = props.value?.length || 0;
                                const min = props.field.length.min;
                                const max = props.field.length.max;

                                if(length > 0 && length < min) return `${min}/${length}`;
                                if(length >= (max - (max * 0.2))) return `${length}/${max}`;
                                return '';
                            })()}
                        </Text>}
                </View>
            </View> );
}

export const Icon_Button = (props:{source:ImageSourcePropType, imageStyle:ImageStyle, onPress:((event: GestureResponderEvent) => void)}):JSX.Element => {
    return ( <TouchableOpacity onPress={props.onPress}>
                 <Image source={props.source} style={props.imageStyle} />
             </TouchableOpacity> );
}

export const DatePicker = (props:{field:InputField, validationLabel?:string, onConfirm:((date:Date) => void), validationStyle?:TextStyle, date:string, labelStyle?:TextStyle }):JSX.Element => {
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const styles = StyleSheet.create({
        containerStyle: {
            marginVertical: 5,
        }
    });

    return (
        <View style={styles.containerStyle}>

            <TouchableOpacity
                onPress={(event:GestureResponderEvent) => setDatePickerVisible(true)}
            >
                <View pointerEvents='none'>
                    <Input_Field 
                        field={props.field}
                        value={formatRelativeDate(props.date)}
                        onChangeText={() => null}
                        validationLabel={props.validationLabel}
                        validationStyle={props.validationStyle}
                        labelStyle={(props.validationLabel && {color: COLORS.primary}) || undefined}
                        inputStyle={(props.validationLabel && {borderColor: COLORS.primary}) || undefined}
                        containerStyle={{alignSelf: "center"}}
                        editable={false}
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

export const Dropdown_Select = (props:{field:InputSelectionField, setSelectedValue:((val:string|number) => void), defaultValue?:string|number,
                                        labelStyle?:TextStyle, validationLabel?:string, validationStyle?:TextStyle }):JSX.Element => {

    const optionList:SelectListItem[] = useMemo(() => (props.field.selectOptionList || []).map((value, index) => ({
            key: `${index}_${value}`,
            value,
            displayLabel: props.field.displayOptionList[index] ?? String(value),
        })), [props.field.selectOptionList, props.field.displayOptionList]);

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
            borderColor: COLORS.accent,
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
            <Text allowFontScaling={false} style={[styles.labelStyle, { color: props.validationLabel ? COLORS.primary : COLORS.transparentWhite }]}>
                <Text style={{ color: props.validationLabel ? COLORS.primary : COLORS.accent }}>{props.field.required ? '* ' : '  '}</Text>{props.field.title}</Text>
            <SelectList 
                optionList={optionList}
                defaultOption={optionList.find(opt => opt.value === props.defaultValue)}
                onSelectValue={(val:string|number) => props.setSelectedValue(val)}
                search={false}

                boxStyles={{ ...styles.selectBoxStyle, borderColor: props.validationLabel ? COLORS.primary : COLORS.accent }}
                dropdownTextStyles={styles.dropdownText}
                inputStyles={styles.dropdownSelected}
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

export const Multi_Dropdown_Select = (props:{field:InputSelectionField, defaultValueList?:(string|number)[], setSelectedValueList:((val:(string|number)[]) => void),
                                            label?:string, labelStyle?:TextStyle, validationLabel?:string, validationStyle?:TextStyle, boxStyle?:ViewStyle}):JSX.Element => {

    const optionList:SelectListItem[] = useMemo(() => (props.field.selectOptionList || []).map((value, index) => ({
            key: `${index}_${value}`,
            value,
            displayLabel: props.field.displayOptionList[index] ?? String(value),
        })), [props.field.selectOptionList, props.field.displayOptionList]);

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
        selectBoxStyle: {
            borderColor: COLORS.accent,
            justifyContent: "center"
        },
        containerStyle: {
            marginVertical: 5,
        },
        validationStyle: {
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
            <Text allowFontScaling={false} style={[styles.labelStyle, { color: props.validationLabel ? COLORS.primary : COLORS.transparentWhite }]}>
                <Text style={{ color: props.validationLabel ? COLORS.primary : COLORS.accent }}>{props.field.required ? '* ' : '  '}</Text>{props.field.title}</Text>
                <MultipleSelectList 
                    onSelectValueList={(list:(string|number)[]) => props.setSelectedValueList(list)}
                    optionList={optionList}
                    defaultOptions={ optionList.filter(option => props.defaultValueList?.includes(option.value))}
                    boxStyles={{ ...styles.selectBoxStyle, borderColor: props.validationLabel ? COLORS.primary : COLORS.accent }}
                    dropdownTextStyles={styles.dropdownText}
                    inputStyles={styles.dropdownSelected}
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
            {props.validationLabel && <Text allowFontScaling={false} style={styles.validationStyle}>{props.validationLabel}</Text>}

        </View>
        
      )
   
}


export const EditCustomStringList = (props: {field:InputField, valueList:string[], onChange: (val: string[]) => void, getCleanValue:(item:string) => string, getDisplayValue:(item:string) => string,
                                            labelStyle?:TextStyle, validationLabel?:string, validationStyle?:TextStyle }) => {
    const [list, setList] = useState<string[]>(props.valueList || []);
    const [newValue, setNewValue] = useState<string>('');

    useEffect(() => {
        setList(props.valueList || []);
    }, [props.valueList]);

    const onAdd = () => {
        const value = props.getCleanValue(newValue);
        if (value.length > 0 && !list.includes(value)) {
            const updatedList = [...list, value];
            setList(updatedList);
            props.onChange(updatedList);
        }
        setNewValue('');
    };

    const onRemove = (item: string) => {
        const newList = list.filter(i => i !== item);
        setList(newList);
        props.onChange(newList);
    };

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
            flex: 1,
        },
        containerStyle: {
            marginVertical: 5,
        },
        listContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 10,
        },
        listItem: {
            backgroundColor: COLORS.accent,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            marginRight: 6,
            marginBottom: 6,
        },
        listItemText: {
            ...theme.text,
            color: COLORS.transparentWhite,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        input: {
            ...theme.text,
            flex: 1,
            borderColor: COLORS.accent,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            height: 40,

            color: COLORS.transparentWhite,
        },
        inputButtonStyle: {
            backgroundColor: COLORS.accent,
            marginLeft: 10,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
        },
        validationStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 5,
            ...props.validationStyle
        }
    });


    return (
        <View style={styles.containerStyle}>
            <Text allowFontScaling={false} style={[styles.labelStyle, { color: props.validationLabel ? COLORS.primary : COLORS.transparentWhite }]}>
                <Text style={{ color: props.validationLabel ? COLORS.primary : COLORS.accent }}>{props.field.required ? '* ' : '  '}</Text>{props.field.title}</Text>
            {list.length > 0 && (
                <View style={styles.listContainer}>
                    {list.map(item => (
                        <TouchableOpacity key={item} onPress={() => onRemove(item)} style={styles.listItem}>
                            <Text allowFontScaling={false} style={styles.listItemText}>{props.getDisplayValue(item)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    value={props.getDisplayValue(newValue)}
                    onChangeText={setNewValue}
                    onSubmitEditing={onAdd}

                    style={styles.input}
                    placeholder='New'
                    placeholderTextColor={COLORS.transparentWhite}
                    returnKeyType='done'
                    autoCapitalize='none'
                    autoCorrect={false}
                />
                <Raised_Button buttonStyle={styles.inputButtonStyle}
                    text={'ADD'}
                    onPress={onAdd}
                />
            </View>

            {props.validationLabel && <Text allowFontScaling={false} style={styles.validationStyle}>{props.validationLabel}</Text>}
        </View>
    );
};


export const SelectSlider = (props:{field:InputRangeField, defaultValue: number, onValueChange:((val:string) => void), defaultMaxValue?:number, onMaxValueChange?: (val:string) => void,
                                    labelStyle?:TextStyle, validationLabel?:string, validationStyle?:TextStyle}):JSX.Element => {

    const [sliderValue, setSliderValue] = useState<number>(isNaN(props.defaultValue) ? Number(props.field.minValue) : props.defaultValue);
    const [maxSliderValue, setMaxSliderValue] = useState<number>((props.defaultMaxValue && isNaN(props.defaultMaxValue)) ? props.defaultMaxValue : Number(props.field.maxValue));

    const onSliderValueChange = (value:number) => {
        setSliderValue(value);
        props.onValueChange(value.toString())
    }

    const onMaxSliderValueChange = (value: number) => {
        setMaxSliderValue(value);
        props.onMaxValueChange?.(value.toString());
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
        validationStyle: {
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
            <Text allowFontScaling={false} style={[styles.labelStyle, { color: props.validationLabel ? COLORS.primary : COLORS.transparentWhite }]}>
                <Text style={{ color: props.validationLabel ? COLORS.primary : COLORS.accent }}>{props.field.required ? '* ' : '  '}</Text>{props.field.title}</Text>
            <Text allowFontScaling={false} style={styles.sliderValueText}>{sliderValue}{(props.field.maxField) ? 'Min:' : ''}</Text>
            <Slider 
                minimumValue={Number(props.field.minValue)}
                maximumValue={Number(props.field.maxValue)}
                value={props.defaultValue}
                onValueChange={onSliderValueChange}
                step={1}
                thumbTintColor={COLORS.accent}
                minimumTrackTintColor={COLORS.accent}
                maximumTrackTintColor={COLORS.accent}
            />
            {(props.field.maxField) && (
                <>
                    <Text allowFontScaling={false} style={styles.sliderValueText}>{maxSliderValue} Max:</Text>
                    <Slider
                        minimumValue={Number(props.field.minValue)}
                        maximumValue={Number(props.field.maxValue)}
                        value={maxSliderValue}
                        onValueChange={onMaxSliderValueChange}
                        step={1}
                        thumbTintColor={COLORS.accent}
                        minimumTrackTintColor={COLORS.accent}
                        maximumTrackTintColor={COLORS.accent}
                    />
                </>
            )}
            {props.validationLabel && <Text allowFontScaling={false} style={styles.validationStyle}>{props.validationLabel}</Text>}
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

export const FolderButton = (props:{callback?:(() => void), buttonView?:ViewStyle}):JSX.Element => {
    const styles = StyleSheet.create({
        folderButton: {
            justifyContent: "center",
            alignItems: "center",
            height: 55,
            width: 55,
            borderRadius: 15,
          },
          folderButtonView: {
            position: "absolute",
            top: 1,
            right: 1,
            ...props.buttonView
          },
    })

    return (
        <SafeAreaView style={styles.folderButtonView}>
            <TouchableOpacity
                onPress={() => {
                    props.callback && props.callback()
                }}
            >
                <View style={styles.folderButton}>
                <Ionicons 
                    name="folder-outline"
                    color={COLORS.accent}
                    size={30}
                />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export const Filler = (props:{fillerStyle?:ViewStyle}):JSX.Element => {

    const styles = StyleSheet.create({
        fillerView: {
            height: 90,
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

export const ProcessingFiller = (props:{callback:((args?:any) => void)}) => {
    const styles = StyleSheet.create({
        default: {
            backgroundColor: COLORS.black,
            flex: 1
        },
        text: {
            ...theme.title,
            fontSize: 32,
            textAlign: "center"
        }
    })

    return (
        <SafeAreaView style={styles.default}>
            <Text style={styles.text}>Please wait</Text>
            <BackButton callback={props.callback} />
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
