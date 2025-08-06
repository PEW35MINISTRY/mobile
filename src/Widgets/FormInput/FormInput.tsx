import { DOMAIN, ENVIRONMENT } from "@env";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import InputField, { InputType, InputSelectionField, isListType, ENVIRONMENT_TYPE, InputRangeField } from "../../TypesAndInterfaces/config-sync/input-config-sync/inputField";
import validateInput, { InputTypesAllowed, InputValidationResult } from "../../TypesAndInterfaces/config-sync/input-config-sync/inputValidation";
import theme, { COLORS } from "../../theme";
import { Input_Field, Dropdown_Select, DatePicker, Multi_Dropdown_Select, SelectSlider, Filler, EditCustomStringList } from "../../widgets";
import { FormSubmit, FormInputProps } from "./form-input-types";
import ToastQueueManager from "../../utilities/ToastQueueManager";
import { SelectListItem } from "react-native-dropdown-select-list";
import { testAccountAvailable } from "./form-utilities";
import { getEnvironment } from "../../utilities/utilities";

export const FormInput = forwardRef<FormSubmit, FormInputProps>(({modelIDFieldDetails = {modelIDField:'modelID', modelID:-1}, validateUniqueFields = true, ...props}:FormInputProps, ref):JSX.Element => {
    const [simpleValidationOnly, setSimpleValidationOnly] = useState<boolean>(true);

    /* Populate Current/Default Values */
    const createCurrentValueMap = ():Record<string, InputTypesAllowed> => {
        const values: Record<string, InputTypesAllowed> = {};

        for(const field of props.fields) {
            const key = field.field;
            const value = props.defaultValues?.[key] ?? field.value;

            if(value != null) { //Evaluates against both undefined and null
                if(field.type === InputType.SELECT_LIST) {
                    values[key] = String(value);
                } else if(field.type === InputType.MULTI_SELECTION_LIST) {
                    values[key] = (Array.isArray(value) && value.length > 0)
                        ? value.map(v => String(v))
                        : [];
                } else
                    values[key] = value;
            } else if(isListType(field.type))
                values[key] = [];
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
        clearErrors,
        trigger
      } = useForm({  defaultValues: createCurrentValueMap() }); 


    /* Form Submit & Final Validations */
    useImperativeHandle(ref, () => ({
        onHandleSubmit: async () => {
            await handleSubmit(async() => {
                let formValues = getValues();

                const uniqueFields:Map<string, string> = new Map([[modelIDFieldDetails.modelIDField, modelIDFieldDetails.modelID.toString()]]);

                props.fields.forEach((field:InputField) => {
                    const currentValue = formValues[field.field];

                    // Auto-fill required fields if undefined
                    if(currentValue === undefined && field.required) {
                        if(field instanceof InputSelectionField && field.type === InputType.SELECT_LIST)
                            setValue(field.field, field.selectOptionList[0], { shouldValidate: true });
                        else if(field.type === InputType.DATE)
                            setValue(field.field, (!isNaN(Number(field.value)) && Number(field.value) > 0)
                                                    ? new Date(Number(field.value)).toISOString()
                                                    : new Date().toISOString(),
                                    { shouldValidate: true });
                        else
                            setValue(field.field, field.value || '', { shouldValidate: true });
                    }

                    if(field.unique)
                        uniqueFields.set(field.field, String(formValues[field.field] ?? ''));
                });
                formValues = getValues();

                //Check required fields
                const missingField:InputField|undefined = props.fields.find((field:InputField) => {
                    const value:InputTypesAllowed = formValues[field.field];
                    const isMissing:boolean = field.required && (!value || String(value).length === 0);
                    if(isMissing && [ENVIRONMENT_TYPE.LOCAL].includes(getEnvironment())) console.error(`Required field is missing:`, field.field, value);
                    return isMissing;
                });

//Test unique fields as combination
                let incompleteIdentityProperty:string|undefined = undefined;
                if(!missingField && validateUniqueFields && uniqueFields.size > 1) {
                    for(const [field, value] of uniqueFields.entries()) {
                        if(value === undefined || value.length === 0) {
                            incompleteIdentityProperty = field;
                            [ENVIRONMENT_TYPE.LOCAL].includes(getEnvironment()) && console.error(`Identity field is incomplete:`, field, value, uniqueFields);
                            break;
                        }
                    }

                    if(!incompleteIdentityProperty && await testAccountAvailable(uniqueFields) === false) {
                        ToastQueueManager.show({ message: 'Account Exists' });
                        [ENVIRONMENT_TYPE.LOCAL].includes(getEnvironment()) && console.error(`Account already exists:`, uniqueFields);
                        return;
                    }
                }

                //Re-validate stricter before submitting
                setSimpleValidationOnly(false);
                if(!await trigger())
                    ToastQueueManager.show({ message: 'Fix Validations' });
                else if(missingField)
                    ToastQueueManager.show({ message: `${missingField.title} Required` });
                else if(incompleteIdentityProperty)
                    ToastQueueManager.show({ message: `${incompleteIdentityProperty} Incomplete` });
                else
                    props.onSubmit(getValues());
        })();
    },
}));


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
                                    validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                        const result:InputValidationResult = validateInput({field, value, getInputField: (f:string) => formValues[f], simpleValidationOnly });

                                        if(!result.passed && ENVIRONMENT_TYPE.LOCAL === getEnvironment()) console.log(field.field, value, result.description);

                                        //Return 'true' on success or 'validation message' on fail
                                        return result.passed || result.message;
                                    }
                                }}
                                render={({ field: {onChange, onBlur, value}}) =>
                                    <Input_Field
                                        field={field}
                                        value={String(value ?? '')}
                                        onChangeText={onChange}

                                        validationLabel={errors[field.field]?.message}
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
                                        validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                                    const result:InputValidationResult = validateInput({field, value, simpleValidationOnly, getInputField: (f:string) => formValues[f]});

                                                    if(!result.passed && ENVIRONMENT_TYPE.LOCAL === getEnvironment()) console.log(field.field, value, result.description);

                                                    return result.passed || result.message;
                                                }
                                        }}
                                    render={({ field: {onChange, onBlur, value}}) =>               
                                            <DatePicker 
                                                field={field}
                                                date={String(value ?? new Date().toISOString())}
                                                onConfirm={(date:Date) => onChange(date.toISOString())}

                                                validationLabel={errors[field.field]?.message}
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
                                    validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                        const result:InputValidationResult = validateInput({field, value, simpleValidationOnly,
                                                                                getInputField: (f:string) => formValues[f]});  //maxField also validated 

                                        if(!result.passed && ENVIRONMENT_TYPE.LOCAL === getEnvironment()) console.log(rangeField.field, value, formValues[rangeField.maxField ?? -1], result.description);
                              
                                        return result.passed || result.message;
                                    }
                                }}
                                render={({ field: { onChange, value } }) =>
                                    <SelectSlider
                                        field={rangeField}
                                        defaultValue={Number(value ?? rangeField.minValue)}
                                        onValueChange={(val: string) => onChange(val)}

                                        defaultMaxValue={rangeField.maxField ? Number(getValues(rangeField.maxField) ?? rangeField.maxValue) : undefined}
                                        onMaxValueChange={(val: string) => { if(rangeField.maxField) setValue(rangeField.maxField, val, { shouldValidate: true }); }}

                                        validationLabel={errors[rangeField.field]?.message}
                                    />}
                            />);
                        break;

                case InputType.SELECT_LIST:
                    const selectionField:InputSelectionField = field as InputSelectionField;
                    return (
                        <Controller 
                            control={control}
                            key={field.field}
                            name={field.field}
                            rules={{
                                validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                    const result:InputValidationResult = validateInput({ field, value, simpleValidationOnly, getInputField: (f:string) => formValues[f] });

                                    if (!result.passed && ENVIRONMENT_TYPE.LOCAL === getEnvironment()) console.log(selectionField.field, value, result.description);

                                    return result.passed || result.message;
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) =>
                                <Dropdown_Select
                                    field={selectionField}
                                    defaultValue={Array.isArray(value) ? value[0] : value}
                                    setSelectedValue={onChange}

                                    validationLabel={errors[field.field]?.message}
                                />}
                        />
                    );
                    break;
                    
                case InputType.MULTI_SELECTION_LIST:
                    const multiSelectionField:InputSelectionField = field as InputSelectionField;
                    return (
                        <Controller
                            control={control}
                            key={multiSelectionField.field}
                            name={multiSelectionField.field}
                            rules={{
                                validate: (value:InputTypesAllowed, formValues:Record<string, InputTypesAllowed>) => {
                                    const result:InputValidationResult = validateInput({field, value, simpleValidationOnly, getInputField: (f:string) => formValues[f]});

                                    if(!result.passed && ENVIRONMENT_TYPE.LOCAL === getEnvironment()) console.log(multiSelectionField.field, value, result.description);

                                    return result.passed || result.message;
                                }
                            }}
                            render={({ field: { onChange, value } }) =>
                                <Multi_Dropdown_Select
                                    field={multiSelectionField}
                                    defaultValueList={Array.isArray(value) ? value : undefined}
                                    setSelectedValueList={(list:(string | number)[]) => onChange(list.every(v => typeof v === 'number') ? list : list.map(String))}
                                    validationLabel={errors[field.field]?.message}
                                />
                            }
                        />
                    );
                    break;                
                
                case InputType.CUSTOM_STRING_LIST:
                    return (
                        <Controller
                            control={control}
                            key={field.field}
                            name={field.field}
                            rules={{
                                validate: (value: InputTypesAllowed, formValues: Record<string, InputTypesAllowed>) => {
                                    const result:InputValidationResult = validateInput({field, value, getInputField: (f:string) => formValues[f], simpleValidationOnly });

                                    if(!result.passed && ENVIRONMENT_TYPE.LOCAL === getEnvironment()) console.log(field.field, value, result.description);

                                    return result.passed || result.message;
                                }
                            }}
                            render={({ field:{ onChange, value } }) => (
                                <EditCustomStringList
                                    field={field}
                                    valueList={Array.isArray(value) ? value.map(String) : []}
                                    onChange={onChange}

                                    getDisplayValue={(item: string = '') => item.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                    getCleanValue={(item: string = '') => item.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/ /g, '_').toUpperCase()}

                                    validationLabel={errors[field.field]?.message}
                                />
                            )}
                        />
                    );
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
