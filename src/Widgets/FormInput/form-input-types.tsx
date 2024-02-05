import InputField from "../../TypesAndInterfaces/config-sync/input-config-sync/inputField";

export type FormSubmit = {
    onHandleSubmit: () => void;
}

export type FormInputProps = {
    fields:InputField[], 
    defaultValues?:any
    onSubmit:((formValues:Record<string, string | string[]>) => void)
}