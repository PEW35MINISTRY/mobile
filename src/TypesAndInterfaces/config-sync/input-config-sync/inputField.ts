/***** NO DEPENDENCIES - Define all types locally *****/

/*******************************************************
*                    INPUT FIELD                       *
* Sync across all repositories: server, portal, mobile *
********************************************************/

export enum ENVIRONMENT_TYPE {
    LOCAL = 'LOCAL',
    DEVELOPMENT = 'DEVELOPMENT',
    PRODUCTION = 'PRODUCTION'
}

export const SUPPORTED_IMAGE_EXTENSION_LIST = ['png', 'jpg', 'jpeg'];  //Sync with AWS settings

export enum DeviceOSEnum {
    IOS = 'IOS',
    ANDROID = 'ANDROID'
}

export enum InputType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    EMAIL = 'EMAIL',
    PASSWORD = 'PASSWORD',
    DATE = 'DATE',
    SELECT_LIST = 'SELECT_LIST',
    MULTI_SELECTION_LIST = 'MULTI_SELECTION_LIST',
    PARAGRAPH = 'PARAGRAPH',
    USER_ID_LIST = 'USER_ID_LIST',        //Indicate fetch & display user contact list
    CIRCLE_ID_LIST = 'CIRCLE_ID_LIST',    //Indicate fetch & display circle membership list
    CUSTOM_STRING_LIST = 'CUSTOM_STRING_LIST',
    RANGE_SLIDER = 'MAX_MIN_SLIDER',
}

export const isListType = (type:InputType):boolean => [InputType.MULTI_SELECTION_LIST, InputType.USER_ID_LIST, InputType.CIRCLE_ID_LIST, InputType.CUSTOM_STRING_LIST].includes(type)

export type FieldInput = { //For toJSON() response
    title: string,
    field: string, 
    value: string | undefined,
    type: InputType,
    required: boolean,
    validationRegex: string,
    validationMessage: string,
    environmentList:ENVIRONMENT_TYPE[],
}

export default class InputField {
    title: string;
    field: string;
    customField: string | undefined; //Handle Individual Parsing in Model.parseModelSpecificField
    value: string | undefined;
    type: InputType;
    required: boolean;
    unique: boolean;
    hide: boolean;
    validationRegex: RegExp;
    validationMessage: string;
    environmentList: ENVIRONMENT_TYPE[];

    constructor({title, field, customField, value, type=InputType.TEXT, required=false, unique=false, hide=false, validationRegex=new RegExp(/.+/), validationMessage='Invalid Input', environmentList=Object.values(ENVIRONMENT_TYPE) }
        : {title:string, field:string, customField?:string | undefined, value?:string | undefined, type?: InputType, required?:boolean, unique?:boolean, hide?:boolean, validationRegex?: RegExp, validationMessage?: string, environmentList?:ENVIRONMENT_TYPE[]}) {
        this.title = title;
        this.field = field;
        this.customField = customField;
        this.value = value;
        this.type = type;
        this.unique = unique;
        this.required = unique || required;
        this.hide = hide;
        this.validationRegex = validationRegex;
        this.validationMessage = validationMessage;
        this.environmentList = environmentList ?? Object.values(ENVIRONMENT_TYPE);
    };

    setValue(value: string): void {this.value = value; }

    toJSON():FieldInput|undefined {
        return this.hide ? undefined
        : {
            title: this.title,
            field: this.field,
            value: this.value || '',
            type: this.type,
            required: this.required,
            validationRegex: this.validationRegex.source,
            validationMessage: this.validationMessage,
            environmentList: this.environmentList,
        };
    }
}

export class InputSelectionField extends InputField {
    selectOptionList: string[];
    displayOptionList: string[];

    constructor({title, field, customField, value, type, required, unique, hide, validationRegex, validationMessage, environmentList,
        selectOptionList, displayOptionList } :
        {title:string, field:string, customField?:string | undefined, value?:string | undefined, type?: InputType, required?:boolean, unique?:boolean, hide?:boolean, validationRegex?: RegExp, validationMessage?: string, environmentList?:ENVIRONMENT_TYPE[],
            selectOptionList:string[], displayOptionList?:string[] }) {

        super({title, field, customField, value, type, required, unique, hide, validationRegex, validationMessage, environmentList});

        this.selectOptionList = selectOptionList;
        if(Array.isArray(displayOptionList) && displayOptionList.length > 0)
            this.displayOptionList = displayOptionList;
        else
            this.displayOptionList = makeDisplayList(this.selectOptionList);

        //Default Handle List Validations
        if(type == InputType.SELECT_LIST && validationRegex?.source === '.+') { //Testing against InputField default
            this.validationRegex = new RegExp(selectOptionList.join('|'));
            this.validationMessage = 'Please Select'
        }

        if(![InputType.SELECT_LIST, InputType.MULTI_SELECTION_LIST].includes(this.type)) throw new Error(`InputSelectionField - ${field} - Invalid type: ${type}`);
        if(!Array.isArray(this.selectOptionList) || this.selectOptionList.length === 0) throw new Error(`InputSelectionField - ${field} - Empty Selection List`);
        if(!Array.isArray(this.displayOptionList) || this.selectOptionList.length !== this.displayOptionList.length) throw new Error(`InputSelectionField - ${field} - Inconsistent option lists: ${JSON.stringify(this.selectOptionList)} != ${JSON.stringify(this.displayOptionList)}`);
    }
}

export class InputRangeField extends InputField {
    minValue: number | Date;
    maxValue: number | Date;
    maxField?: string; //If supplied, implies 'field' is minField and using MAX_MIN_SLIDER

    constructor({title, field, customField, value, type, required, unique, hide, validationRegex, validationMessage, environmentList,
            minValue, maxValue, maxField } :
        {title:string, field:string, customField?:string | undefined, value?:string | undefined, type?: InputType, required?:boolean, unique?:boolean, hide?:boolean, validationRegex?: RegExp, validationMessage?: string, environmentList?:ENVIRONMENT_TYPE[],
            minValue: number|Date, maxValue: number|Date, maxField?: string }) {

        super({title, field, customField, value, type, required, unique, hide, validationRegex, validationMessage, environmentList});

        this.minValue = minValue;
        this.maxValue = maxValue;
        this.maxField = maxField;

        if(![InputType.RANGE_SLIDER, InputType.DATE].includes(this.type)) throw new Error(`InputRangeField - ${field} - Invalid type: ${type}`);
    }
}

/*************
 * UTILITIES *
 *************/

//Converts underscores to spaces and capitalizes each word
export const makeDisplayText = (text:string = ''):string => text.toLowerCase().split(/[_\s]+/).map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
export const makeDisplayList = (list:string[]):string[] => list.map(value => makeDisplayText(value));

//For parsing JSON Response vs FIELD_LIST and optional field properties
export const checkFieldName = (FIELD_LIST:InputField[], fieldName:string, required?:boolean, unique?:boolean, hide?:boolean):boolean =>
    FIELD_LIST.some(f => ((
        (f.field === fieldName) 
        || (f.customField === fieldName) 
        || ((f instanceof InputRangeField) && (f.maxField === fieldName))
    )
    && (required === undefined || f.required)
    && (unique === undefined || f.unique)
    && (hide === undefined || f.hide)
));
