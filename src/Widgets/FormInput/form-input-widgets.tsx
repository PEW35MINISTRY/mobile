import React, { useState, useEffect, useMemo } from 'react';
import { GestureResponderEvent, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle, ScrollView, SafeAreaView, Keyboard } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Slider from '@react-native-community/slider';
import { MultipleSelectList, SelectListItem } from 'react-native-dropdown-select-list';
import theme, { COLORS, FONT_SIZES } from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import formatRelativeDate from '../../utilities/dateFormat';
import InputField, { InputSelectionField, InputRangeField } from '../../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { Input_Field, Raised_Button } from '../../widgets';



/**************************
 *  INPUT FIELD WIDGETS   *
 * Match COnsistent Theme *
 **************************/

export const ReadOnlyInput = (field:InputField, value:string):JSX.Element => {

    const styles = StyleSheet.create({
        container: {
            marginVertical: 5
        },
        label: {
            ...theme.accent,
            color: COLORS.transparentWhite,
            textAlign: 'left'
        },
        valueWrapper: {
            width: 275,
            marginLeft: 15,
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderColor: COLORS.accent,
            backgroundColor: COLORS.black
        },
        value: {
            ...theme.text,
            fontSize: FONT_SIZES.L,
            color: COLORS.white
        }
    });

    return (
        <View key={field.field} style={styles.container}>
            <Text allowFontScaling={false} style={styles.label}>
                {field.title}
            </Text>

            <View style={styles.valueWrapper}>
                <Text allowFontScaling={false} style={styles.value}>
                    {String(value ?? '')}
                </Text>
            </View>
        </View>
    );
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
                        containerStyle={{alignSelf: 'center'}}
                        editable={false}
                    />
                </View>
            </TouchableOpacity>
            <DateTimePickerModal 
                isVisible={isDatePickerVisible}
                mode='date'
                onConfirm={(date:Date) => {props.onConfirm(date); setDatePickerVisible(false)}}
                onCancel={(event:Date) => setDatePickerVisible(false)}
                date={new Date(props.date)}
            />
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
            textAlign: 'center',
            
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
            textAlign: 'center',
            paddingLeft: 16,
            flex: 1 
        },
        selectBoxStyle: {
            borderColor: COLORS.accent,
            justifyContent: 'center'
        },
        containerStyle: {
            marginVertical: 5,
        },
        validationStyle: {
            ...theme.accent,
            color: COLORS.primary,
            textAlign: 'center',
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
            textAlign: 'center',
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
            textAlign: 'center',
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
            textAlign: 'center',
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
            textAlign: 'center'
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
            textAlign: 'center',
            marginBottom: 5,
            ...props.validationStyle
        },
        sliderValueText: {
            ...theme.text,
            fontSize: FONT_SIZES.L,
            textAlign: 'center'
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
