import React, { useRef, useState, useMemo } from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View, NativeSyntheticEvent, Platform, Pressable, TextInputKeyPressEventData, TextInputSelectionChangeEventData } from "react-native";
import theme, { COLORS, FONT_SIZES, RADIUS } from '../../theme';
import InputField from '../../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import ToastQueueManager from '../../utilities/ToastQueueManager';
import { makeDisplayText } from '../../utilities/utilities';



type TokenCharType = 'NUMERIC' | 'LETTERS' | 'ALPHANUMERIC' | 'TEXT';

export const FormInputTokenEntry = (props: {field:InputField, value:string, onChangeText:(value: string) => void, validationLabel?:string, charType:TokenCharType}) => {
    const maxLength:number = props.field.length?.max ?? 6;
    const inputRef = useRef<TextInput | null>(null);
    const [selection, setSelection] = useState<{ start:number; end:number }>({start: 0, end: 0});

    const filter = (text:string):string => {
        const value:string = String(text ?? '');
        switch(props.charType) {
            case 'NUMERIC':
                return value.replace(/\D/g, '');

            case 'LETTERS':
                return value.replace(/[^A-Za-z]/g, '').toUpperCase();

            case 'ALPHANUMERIC':
                return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

            case 'TEXT':
            default:
                return value;
        }
    }

    const token:string = useMemo(() => {
        return filter(String(props.value ?? '')).slice(0, maxLength);
    }, [props.value, maxLength]);

    const boxes:string[] = useMemo(() => {
        return Array.from({ length: maxLength }, (_, index) => token[index] ?? '');
    }, [token, maxLength]);

    const focusAtIndex = (index:number): void => {
        const clamped:number = Math.max(0, Math.min(maxLength, index));
        inputRef.current?.focus();
        setSelection({start: clamped, end: clamped});
    };

    /* Handles typing, paste, and OTP autofill */
    const onChangeText = (rawText:string): void => {
        const filtered:string = filter(rawText);
        const nextToken:string = filtered.slice(0, maxLength);

        if(rawText.length > 0 && filtered.length !== rawText.length) {
            ToastQueueManager.show({message: `${makeDisplayText(props.charType)} only`});
            console.log(`Some characters were removed because token allows ${props.charType} only.`);
        }

        props.onChangeText(nextToken);
        const caret: number = Math.min(nextToken.length, maxLength);
        setSelection({start:caret, end:caret});
    };

    const onHiddenSelectionChange = (event:NativeSyntheticEvent<TextInputSelectionChangeEventData>):void => {
        setSelection(event.nativeEvent.selection);
    };

    const onHiddenKeyPress = (event:NativeSyntheticEvent<TextInputKeyPressEventData>):void => {
        if(event.nativeEvent.key !== 'Backspace')
            return;

        const caret: number = Math.max(0, Math.min(selection.start, maxLength));
        if(caret <= 0 && token.length === 0)
            return;

        const removeIndex: number = Math.max(0, caret - 1);
        const list:string[] = Array.from({ length: maxLength }, (_, index) => token[index] ?? '');
        list[removeIndex] = '';

        const nextToken:string = filter(list.join('')).slice(0, maxLength);
        props.onChangeText(nextToken);
        setSelection({start:removeIndex, end:removeIndex});
    };

    const keyboardType:KeyboardTypeOptions = (props.charType === 'NUMERIC') ? Platform.select({ ios: 'number-pad', android: 'numeric', default: 'numeric' }) : 'default';
    const activeIndex: number = Math.max(0, Math.min(selection.start, maxLength - 1));

    return (<View style={styles.container} >
            <Text allowFontScaling={false} style={[styles.label, { color: props.validationLabel ? COLORS.primary : COLORS.transparentWhite }]}>
            <Text style={{ color: props.validationLabel ? COLORS.primary : COLORS.accent }}>{props.field.required ? '* ' : '  '}</Text>{props.field.title}</Text>

            <View style={styles.row}>
                {boxes.map((char: string, index: number) => {
                    const isActive: boolean = activeIndex === index;

                    return (
                        <Pressable
                            key={`${props.field.field}-token-box-${index}`}
                            onPress={() => focusAtIndex(index)}
                            style={[styles.box, isActive && styles.boxActive]}
                        >
                            <Text allowFontScaling={false} style={styles.boxText}>{char}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.validationRow}>
                {props.validationLabel && (
                    <Text allowFontScaling={false} style={styles.validationText}>
                        {props.validationLabel}
                    </Text>
                )}

                {props.field.length && (
                    <Text allowFontScaling={false} style={styles.lengthCounter}>
                        {(() => {
                            const length = token.length || 0;
                            const min = props.field.length?.min ?? 0;
                            const max = props.field.length?.max ?? 0;

                            if (min > 0 && length > 0 && length < min) return `${min}/${length}`;
                            if (max > 0 && length >= max - max * 0.2) return `${length}/${max}`;
                            return '';
                        })()}
                    </Text>
                )}
            </View>

            <TextInput
                ref={inputRef}
                value={token}
                onChangeText={onChangeText}
                onSelectionChange={onHiddenSelectionChange}
                onKeyPress={onHiddenKeyPress}
                selection={selection}
                maxLength={maxLength}
                keyboardType={keyboardType}
                autoCorrect={false}
                autoCapitalize='characters'
                textContentType='oneTimeCode'
                autoComplete='one-time-code'
                importantForAutofill='yes'
                style={styles.hiddenInput}
            />
        </View>
    );
}


/* ---------- Styles ---------- */

const styles = StyleSheet.create({
    container: {
        marginVertical: 5
    },
    label: {
        ...theme.accent,
        textAlign: 'left'
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: 275,
        marginLeft: 15,
        marginTop: 6
    },
    box: {
        width: 44,
        height: 52,
        marginHorizontal: 6,
        marginVertical: 6,
        borderRadius: RADIUS,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center'
    },
    boxActive: {
        borderColor: COLORS.primary,
        borderWidth: 2
    },
    boxDisabled: {
        opacity: 0.6
    },
    boxText: {
        ...theme.text,
        fontSize: FONT_SIZES.L,
        color: COLORS.white,
        fontWeight: '700'
    },
    validationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 4,
        width: 275,
        marginLeft: 15
    },
    validationText: {
        ...theme.accent,
        flex: 1,
        color: COLORS.primary,
        textAlign: 'left'
    },
    lengthCounter: {
        ...theme.text,
        fontSize: FONT_SIZES.S,
        color: COLORS.accent,
        textAlign: 'right',
        marginLeft: 'auto',
        flexShrink: 0
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1
    }
});
