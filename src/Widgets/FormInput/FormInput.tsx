import { DOMAIN } from "@env";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import InputField, { InputType, InputSelectionField, isListType,} from "../../TypesAndInterfaces/config-sync/input-config-sync/inputField";
import { RoleEnum, getDOBMaxDate, getDOBMinDate } from "../../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { SelectListItem } from "../../TypesAndInterfaces/custom-types";
import theme, { COLORS } from "../../theme";
import { Input_Field, Dropdown_Select, DatePicker, Multi_Dropdown_Select } from "../../widgets";
import React, { forwardRef, useImperativeHandle } from "react";
import { FormSubmit, FormInputProps } from "./form-input-types";
import { useAppDispatch, useAppSelector } from "../../TypesAndInterfaces/hooks";
import { RootState } from "../../redux-store";

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
                if (field instanceof InputSelectionField) {
                    formValues[field.field] = (props.defaultValues !== undefined && props.defaultValues[field.field] !== undefined && props.defaultValues[field.field] !== null) ? props.defaultValues[field.field] : []; // default value gets passed in as "value" (see isOnGoing in prayer-request-field-config)
                }
                else {
                    formValues[field.field] = (props.defaultValues !== undefined) ? props.defaultValues[field.field] : field.value || "";
                }
            else 
                formValues[field.field] = (props.defaultValues !== undefined) ? props.defaultValues[field.field] : field.value || "";
        });
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
                                (fieldValueIsString(field.type, value)) && 
                                <Input_Field 
                                    label={field.title}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType={(field.type === InputType.NUMBER && "numeric") || "default"}
                                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
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
                                {fieldValueIsString(field.type, value) && 
                                <Input_Field 
                                    label={field.title}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType='default'
                                    textContentType='password'
                                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
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
                                    label={field.title}
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
                        for (var i=0; i<field.displayOptionList.length; i++) {
                            selectListData.push({key: i, value: field.selectOptionList[i]})
                        }

                        const getSelectListDefaultValue = (selectListValue:string | undefined) => {
                            if (selectListValue !== undefined) {
                                const selectListValueString = selectListValue.toString();
                                for (var i=0; i<selectListData.length; i++) {
                                    if (selectListData[i].value == selectListValueString) return selectListData[i];
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
                                        label={field.title}
                                        setSelected={(val:string) => onChange(val)}
                                        data={selectListData}
                                        placeholder="Select"
                                        labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
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
                    const userRole = useAppSelector((state: RootState) => state.account.userProfile.userRole);
                    return (
                    <Controller 
                        control={control}
                        rules={{
                        required: field.required,
                        validate: (value, formValues) => {
                            if (fieldValueIsString(field.type, value)) {
                                if (field.field == 'dateOfBirth') {
                                    const minAge:Date = getDOBMaxDate(RoleEnum[userRole as keyof typeof RoleEnum] || RoleEnum.STUDENT);
                                    const maxAge:Date = getDOBMinDate(RoleEnum[userRole as keyof typeof RoleEnum] || RoleEnum.STUDENT);
                                    const currAge = new Date(value);
                                    console.log(minAge, maxAge, currAge);
                                    if (currAge > minAge || currAge < maxAge) return false;
                                    else return true;
                                }
                                else {
                                    if (value.match(field.validationRegex)) return true;
                                }
 
                            }
                        }
                        }}
                        render={({ field: {onChange, onBlur, value}}) => (
                        <>
                            {fieldValueIsString(field.type, value) &&                         
                                <DatePicker 
                                    buttonText={field.title}
                                    label={field.title}
                                    buttonStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}
                                    onConfirm={(date:Date) => onChange(date.toISOString())}
                                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                                    validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                    validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                    date={value}
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
                        for (var i=0; i<field.displayOptionList.length; i++) {
                            selectListData.push({key: i, value: field.selectOptionList[i]})
                        }

                        const getSelectListDefaultValue = (selectListValues:string[] | undefined) => {
                            console.log(selectListValues);
                            var selected:SelectListItem[] = [];
                            if (selectListValues !== undefined) {
                                selectListValues.forEach((value:string) => {
                                    const valueString = value.toString();
                                    for (var i=0; i<selectListData.length; i++) {
                                        if (selectListData[i].value == valueString) {
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
                                        label={field.title}
                                        labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
                                        validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                        validationStyle={(errors[field.field] && {color: COLORS.primary, maxWidth: 250, alignSelf: "center"}) || undefined}
                                        boxStyle={(errors[field.field] && {borderColor: COLORS.primary, maxWidth: 250}) || {borderColor: COLORS.accent}}
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
                                (fieldValueIsString(field.type, value)) && 
                                <Input_Field 
                                    label={field.title}
                                    value={value}
                                    onChangeText={onChange}
                                    multiline={true}
                                    keyboardType={(field.type === InputType.NUMBER && "numeric") || "default"}
                                    labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}
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
                // Default case will likely never happen, but its here to prevent undefined behavior per TS
                default:
                    return <></>
                }

            })
        }
    </ScrollView>)
});
