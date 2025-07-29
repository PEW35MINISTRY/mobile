import InputField from "../../TypesAndInterfaces/config-sync/input-config-sync/inputField";
import { InputTypesAllowed } from "../../TypesAndInterfaces/config-sync/input-config-sync/inputValidation";

export type FormSubmit = {
    onHandleSubmit: () => Promise<void>;
}

export type FormInputProps = {
    fields:InputField[], 
    defaultValues?: Record<string, any>,
    modelIDFieldDetails?:{modelIDField:string, modelID:number},
    validateUniqueFields?:boolean,
    onSubmit:((formValues:Record<string, InputTypesAllowed>) => void),
}
