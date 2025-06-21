import { DOMAIN, ENVIRONMENT } from "@env";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import InputField, { InputType, InputSelectionField, isListType, ENVIRONMENT_TYPE, InputRangeField } from "../../TypesAndInterfaces/config-sync/input-config-sync/inputField";
import validateInput, { InputTypesAllowed, InputValidationResult } from "../../TypesAndInterfaces/config-sync/input-config-sync/inputValidation";
import theme, { COLORS } from "../../theme";
import { Input_Field, Dropdown_Select, DatePicker, Multi_Dropdown_Select, SelectSlider, Filler } from "../../widgets";
import { FormSubmit, FormInputProps } from "./form-input-types";
import ToastQueueManager from "../../utilities/ToastQueueManager";
import { SelectListItem } from "react-native-dropdown-select-list";
import { testAccountAvailable } from "./form-utilities";
import { getEnvironment } from "../../utilities/utilities";

export const FormInput = forwardRef<FormSubmit, FormInputProps>(({modelIDFieldDetails = {modelIDField:'modelID', modelID:-1}, validateUniqueFields = true, ...props}:FormInputProps, ref):JSX.Element => {

    /* Populate Current/Default Values */
    const createCurrentValueMap = ():Record<string, InputTypesAllowed> => {
        const values: Record<string, InputTypesAllowed> = {};

        for(const field of props.fields) {
            const key = field.field;
            const currentValue = props.defaultValues?.[key];

            if(currentValue !== undefined && currentValue !== null)
                values[key] = currentValue;
            else if(field.value !== undefined && field.value !== null)
                values[key] = field.value;
            else if(isListType(field.type))
                values[key] = [];
            // else if(field.type === InputType.NUMBER)
            //    values[key] = 0;
            // else 
            //    values[key] = "";
        }

        return values;
    };

    const {
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        setValue,
        setError,
        clearErrors
      } = useForm({  defaultValues: createCurrentValueMap() }); 


    /* Form Submit & Final Validations */
    useImperativeHandle(ref, () => ({
        onHandleSubmit: async () => {
            await handleSubmit(async() => {
                const formValues = getValues();

                const uniqueFields:Map<string, string> = new Map([[modelIDFieldDetails.modelIDField, modelIDFieldDetails.modelID.toString()]]);

                props.fields.forEach((field:InputField) => {
                    const currentValue = formValues[field.field];

                    // Auto-fill required fields if undefined
                    if(currentValue === undefined && field.required) {
                        if(field instanceof InputSelectionField && field.type === InputType.SELECT_LIST)
                            setValue(field.field, field.selectOptionList[0]);
                        else if(field.type === InputType.DATE)
                            setValue(field.field, (!isNaN(Number(field.value)) && Number(field.value) > 0)
                                                    ? new Date(Number(field.value)).toISOString()
                                                    : new Date().toISOString());                    
                        else
                            setValue(field.field, field.value || '');
                    }

                    if(field.unique)
                        uniqueFields.set(field.field, String(formValues[field.field] ?? ''));
                });

                //Check required fields
                const missingField:InputField|undefined = props.fields.find((field:InputField) => {
                    const value:InputTypesAllowed = formValues[field.field];
                    const isMissing:boolean = field.required && (!value || String(value).length === 0);
                    if(isMissing && [ENVIRONMENT_TYPE.LOCAL].includes(getEnvironment())) console.error(`Required field is missing:`, field.field, value);
                    return isMissing;
                });

                if(missingField) {
                    ToastQueueManager.show({ message: `${missingField.title} Required` });
                    return;
                }


                //Test unique fields as combination
                if(validateUniqueFields && uniqueFields.size > 1) {
                    for(const [field, value] of uniqueFields.entries()) {
                        if(value === undefined || value.length === 0) {
                            [ENVIRONMENT_TYPE.LOCAL].includes(getEnvironment()) && console.error(`Identity field is incomplete:`, field, value);
                            ToastQueueManager.show({ message: `${field} Incomplete` });
                            return;
                        }
                    }

                    if(await testAccountAvailable(uniqueFields) === false) {
                        ToastQueueManager.show({ message: 'Account Exists' });
                        [ENVIRONMENT_TYPE.LOCAL].includes(getEnvironment()) && console.error(`Account already exists:`, uniqueFields);
                        return;
                    }
                }

                //Re-validate before submitting | Stops on first failed validation
                if(props.fields.every((field:InputField) => {
                        const result = validateInput({ field, value: formValues[field.field], getInputField: (f: string) => formValues[f], simpleValidationOnly: false });

                        if(!result.passed)
                            setError(field.field, { type: 'manual', message: result.message });
                        else
                            clearErrors(field.field);
                
                        return result.passed;                        
                })) {
                    props.onSubmit(getValues());

                } else
                    ToastQueueManager.show({ message: 'Fix Validations' });
        })();
    },
}));



    const styles = StyleSheet.create({
        ...theme,
        centerInputStyle: {
            alignSelf: "center"
        },
        validationStyle: {
            color: COLORS.primary, 
            borderColor: COLORS.primary,
            maxWidth: '90%', 
            alignSelf: "center",
            textAlign: "center"
        },
        validationStyleDropdown: {
            alignSelf: "center",
            textAlign: "center",
            color: COLORS.primary, 
            borderColor: COLORS.primary,
        }
    })

    return (
        <ScrollView style={{maxWidth: '90%'}}>{
            (props.fields).filter((field:InputField)=>field.environmentList.includes(getEnvironment()))
              .map((field:InputField, index:number) => {
                switch(field.type) {
                    case InputType.TEXT:
                    case InputType.NUMBER:
                    case InputType.EMAIL:
                    case InputType.PASSWORD:
                    case InputType.PARAGRAPH: 
                        return (
                            <Controller 
                                control={control}
                                key={field.field}
                                name={field.field}
                                rules={{
                                    required: field.required,
                                    minLength: field.length?.min,
                                    maxLength: field.length?.max,
                                    validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                        const result:InputValidationResult = validateInput({
                                                field,
                                                value,
                                                getInputField: (f:string) => formValues[f],
                                                simpleValidationOnly: true
                                            });

                                        //Return 'true' on success or 'validation message' on fail
                                        return result.passed || result.message;
                                    }
                                }}
                                render={({ field: {onChange, onBlur, value}}) =>
                                    <Input_Field
                                        value={String(value)}
                                        onChangeText={onChange}
                                        keyboardType={(field.type === InputType.NUMBER) ? 'numeric'
                                                    : (field.type === InputType.EMAIL) ? 'email-address' : 'default'}

                                        textContentType={(field.type === InputType.PASSWORD ? 'password' : undefined)}

                                        multiline={(field.type === InputType.PARAGRAPH)}
                                        autoCapitalize={false}

                                        containerStyle={styles.centerInputStyle}
                                        inputStyle={(errors[field.field] && styles.validationStyle) || undefined}

                                        label={field.title}
                                        labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}

                                        validationLabel={String(errors[field.field])}
                                        validationStyle={(errors[field.field] && styles.validationStyle) || undefined}
                                    />}

                            />);
                            break;

                        case InputType.DATE:
                            return (
                                <Controller 
                                    control={control}
                                    key={field.field}
                                    name={field.field}                        
                                    rules={{
                                        required: field.required,
                                        validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                                    const result:InputValidationResult = validateInput({field, value, simpleValidationOnly: true, getInputField: (f:string) => formValues[f]});
                                                    return result.passed || result.message;
                                                }
                                        }}
                                    render={({ field: {onChange, onBlur, value}}) =>               
                                            <DatePicker 
                                                date={String(value)}
                                                onConfirm={(date:Date) => onChange(date.toISOString())}

                                                label={field.title}
                                                labelStyle={(errors[field.field] && {color: COLORS.primary}) || undefined}

                                                buttonText={field.title}
                                                buttonStyle={(errors[field.field] && {borderColor: COLORS.primary}) || undefined}

                                                validationLabel={(errors[field.field] && field.validationMessage) || undefined}
                                                validationStyle={(errors[field.field] && styles.validationStyleDropdown) || undefined}
                                            />}
                                    />);
                            break;

                    case InputType.RANGE_SLIDER:
                        const rangeField:InputRangeField = field as InputRangeField;
                        return (
                            <Controller 
                                control={control}
                                key={field.field}
                                name={field.field}
                                rules={{
                                    required: field.required,
                                    validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                        const result:InputValidationResult = validateInput({field, value, simpleValidationOnly: true,
                                                                                getInputField: (f:string) => formValues[f]});  //maxField also validated                                            
                                        return result.passed || result.message;
                                    }
                                }}
                                render={({ field: { onChange, value } }) =>
                                    <SelectSlider
                                        defaultValue={Number(value)}
                                        onValueChange={(val: string) => onChange(val)}

                                        maxField={rangeField.maxField}
                                        defaultMaxValue={rangeField.maxField ? Number(getValues(rangeField.maxField) ?? rangeField.maxValue) : undefined}
                                        onMaxValueChange={(val: string) => { if(rangeField.maxField) setValue(rangeField.maxField, val, { shouldValidate: true }); }}

                                        minValue={Number(rangeField.minValue)}
                                        maxValue={Number(rangeField.maxValue)}

                                        label={rangeField.title}
                                        labelStyle={errors[rangeField.field] ? { color: COLORS.primary } : undefined}
                                        validationLabel={errors[rangeField.field] ? field.validationMessage : undefined}
                                        validationStyle={errors[rangeField.field] ? styles.validationStyle : undefined}
                                    />}
                            />);
                        break;

                case InputType.SELECT_LIST:
                    const selectionField: InputSelectionField = field as InputSelectionField;
                    const selectionOptions:SelectListItem[] = selectionField.selectOptionList.map((val, i) => ({key: selectionField.displayOptionList?.[i] ?? val, value: val}));
                    return (
                        <Controller 
                            control={control}
                            key={field.field}
                            name={field.field}
                            rules={{
                                required: field.required,
                                validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                    const result:InputValidationResult = validateInput({field, value, simpleValidationOnly: true, getInputField: (f:string) => formValues[f]});
                                    return result.passed || result.message;
                                }
                            }}
                            render={({ field: {onChange, onBlur, value}}) =>
                                <Dropdown_Select
                                    options={selectionOptions}
                                    defaultOption={selectionOptions.find(opt => opt.value === value)}
                                    setSelectedValue={onChange}

                                    boxStyle={errors[field.field] ? styles.validationStyleDropdown : { borderColor: COLORS.accent }}

                                    label={selectionField.title}
                                    labelStyle={errors[field.field] ? { color: COLORS.primary } : undefined}

                                    validationLabel={errors[field.field] ? field.validationMessage : undefined}
                                    validationStyle={errors[field.field] ? styles.validationStyle : undefined}
                                />}
                        />);
                    break;
                    
                case InputType.MULTI_SELECTION_LIST:
                    const multiSelectionField: InputSelectionField = field as InputSelectionField;
                    const multiSelectionOptions:SelectListItem[] = multiSelectionField.selectOptionList.map((val, i) => ({key: multiSelectionField.displayOptionList?.[i] ?? val, value: val}));
                        <Controller
                            control={control}
                            key={multiSelectionField.field}
                            name={multiSelectionField.field}
                            rules={{
                                required: field.required,
                                validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                    const result:InputValidationResult = validateInput({field, value, simpleValidationOnly: true, getInputField: (f:string) => formValues[f]});
                                    return result.passed || result.message;
                                }
                            }}
                            render={({ field: { onChange, value } }) =>
                                <Multi_Dropdown_Select
                                    options={multiSelectionOptions}
                                    defaultOptions={Array.isArray(value) ? value.map(val => multiSelectionOptions.find(opt => opt.value === val)).filter((opt): opt is SelectListItem => opt !== undefined) : undefined}
                                    setSelectedValueList={onChange}

                                    boxStyle={errors[multiSelectionField.field] ? styles.validationStyleDropdown : { borderColor: COLORS.accent }}

                                    label={multiSelectionField.title}
                                    labelStyle={errors[field.field] ? { color: COLORS.primary } : undefined}

                                    validationLabel={errors[field.field] ? field.validationMessage : undefined}
                                    validationStyle={errors[field.field] ? styles.validationStyle : undefined}
                                />}
                        />;
                    break;                
                
                // Default case will likely never happen, but its here to prevent undefined behavior per TS
                case InputType.CUSTOM:
                default:
                    return <></>;
            }})}
        <Filler />
    </ScrollView>
    );
});
