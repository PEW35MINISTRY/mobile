/***** NO DEPENDENCIES - Define all types locally *****/

/*******************************************************
*        PROFILE FIELD CONFIGURATION FILE
* Sync across all repositories: server, portal, mobile
*******************************************************/

const EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/);
const DATE_REGEX = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/); //1970-01-01T00:00:00.013Z
    
export const MIN_STUDENT_AGE = 13;
export const MAX_STUDENT_AGE = 18;

/***************************************
*    PROFILE TYPES AND DEPENDENCIES
****************************************/

export enum GenderEnum {
    MALE = 'Male',
    FEMALE = 'Female'
}

export enum RoleEnum {
    STUDENT = 'Student',                      //General user only access to mobile app.
    CIRCLE_LEADER = 'Circle Leader',          //Allowed to create and manage small groups of students.
    CONTENT_APPROVER = 'Content Approver',    //Special access to content overview.
    DEVELOPER = 'Developer',                  //Full access to features; but not user data.
    ADMIN = 'Administrator',                  //All access and privileges.
}

export enum InputType {
    TEXT = 'text',
    NUMBER = 'number',
    EMAIL = 'email',
    PASSWORD = 'password',
    DATE = 'date',
    SELECT_LIST = 'selectedList',
    PARAGRAPH = 'textArea'
}

export type FieldInput = {
    title: string,
    field: string, 
    value: string | undefined,
    type: InputType,
    required: boolean,
    validationRegex: string,
    validationMessage: string,
    selectOptionList: string[] | number[]
}

export class InputField {
    title: string;
    field: string;
    value: string | undefined;
    type: InputType;
    required: boolean;
    unique: boolean;
    validationRegex: RegExp;
    validationMessage: string;
    selectOptionList: string[];

    constructor({title, field, value, type=InputType.TEXT, required=false, unique=false, validationRegex=new RegExp(/.*/), validationMessage='Invalid Input', selectOptionList=[]} :
        {title:string, field:string, value?:string | undefined, type?: InputType, required?:boolean, unique?:boolean, validationRegex?: RegExp, validationMessage?: string, selectOptionList?: string[]}) {
        this.title = title;
        this.field = field;
        this.value = value;
        this.type = type;
        this.unique = unique;
        this.required = unique || required;
        this.validationRegex = validationRegex;
        this.validationMessage = validationMessage;
        this.selectOptionList = selectOptionList;
        //Default Handle List Validations
        if(type == InputType.SELECT_LIST && validationRegex.source === '.*') {
            this.validationRegex = new RegExp(selectOptionList.join("|"));
            this.validationMessage = 'Please Select'
        }
    };

    setValue(value: string): void { this.value = value; }

    toJSON():FieldInput {
        return {
            title: this.title,
            field: this.field,
            value: this.value,
            type: this.type,
            required: this.required,
            validationRegex: this.validationRegex.source,
            validationMessage: this.validationMessage,
            selectOptionList: this.selectOptionList
        };
    }
}

export const getDateYearsAgo = (years: number = 13):Date => {
    let date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date;
}

//HTML date input supports: 'YYY-MM-DD'
export const getShortDate = (dateISO:string):string => dateISO ? dateISO.split('T')[0] : getDateYearsAgo(13).toISOString().toString().split('T')[0];

/*****************************************
*   FIELD LISTS: LOGIN | SIGNUP | EDIT
* Used for dynamic display and privileges
******************************************/

export const LOGIN_PROFILE_FIELDS:InputField[] = [
    new InputField({title: 'Email Address', field: 'email', type: InputType.EMAIL, unique: true,  validationRegex: EMAIL_REGEX, validationMessage: 'Required, invalid email format.' }),
    new InputField({title: 'Password', field: 'password', type: InputType.PASSWORD, required: true, validationRegex: new RegExp(/.{5,20}/), validationMessage: 'Required, 5-20 characters.' }),
]

//Note: extending list forces the order, may need a sortID or duplicating for now
export const EDIT_PROFILE_FIELDS:InputField[] = [
    new InputField({title: 'First Name', field: 'firstName', type: InputType.TEXT, required: true, validationRegex: new RegExp(/.{1,30}/), validationMessage: 'Required, max 30 characters.' }),
    new InputField({title: 'Last Name', field: 'lastName', type: InputType.TEXT, required: true, validationRegex: new RegExp(/.{1,30}/), validationMessage: 'Required, max 30 characters.' }),
    new InputField({title: 'Public Name', field: 'displayName', type: InputType.TEXT, unique: true, validationRegex: new RegExp(/.{1,15}/), validationMessage: 'Must be unique, max 15 characters.' }),
    new InputField({title: 'Password', field: 'password', type: InputType.PASSWORD, required: true, validationRegex: new RegExp(/.{5,20}/), validationMessage: 'Required, 5-20 characters.' }),
    new InputField({title: 'Verify Password', field: 'passwordVerify', type: InputType.PASSWORD, required: true, validationRegex: new RegExp(/.{5,20}/), validationMessage: 'Required, must match password field.' }),
    new InputField({title: 'Postal Code', field: 'postalCode', type: InputType.TEXT, required: true, validationRegex: new RegExp(/.{5,15}/), validationMessage: 'Required, 5-15 characters.' }),
];

export const SIGNUP_PROFILE_FIELDS_STUDENT:InputField[] = [
    new InputField({title: 'First Name', field: 'firstName', type: InputType.TEXT, required: true, validationRegex: new RegExp(/.{1,30}/), validationMessage: 'Required, max 30 characters.' }),
    new InputField({title: 'Last Name', field: 'lastName', type: InputType.TEXT, required: true, validationRegex: new RegExp(/.{1,30}/), validationMessage: 'Required, max 30 characters.' }),
    new InputField({title: 'Public Name', field: 'displayName', type: InputType.TEXT, unique: true, validationRegex: new RegExp(/.{1,15}/), validationMessage: 'Must be unique, max 15 characters.' }),
    new InputField({title: 'Email Address', field: 'email', type: InputType.EMAIL, unique: true,  validationRegex: EMAIL_REGEX, validationMessage: 'Required, invalid email format.' }),
    new InputField({title: 'Password', field: 'password', type: InputType.PASSWORD, required: true, validationRegex: new RegExp(/.{5,20}/), validationMessage: 'Required, 5-20 characters.' }),
    new InputField({title: 'Verify Password', field: 'passwordVerify', type: InputType.PASSWORD, required: true, validationRegex: new RegExp(/.{5,20}/), validationMessage: 'Required, must match password field.' }),
    new InputField({title: 'Postal Code', field: 'postalCode', required: true, validationRegex: new RegExp(/.{5,15}/), validationMessage: 'Required, 5-15 characters.' }),
    new InputField({title: 'Gender', field: 'gender', type: InputType.SELECT_LIST, required: true, selectOptionList: Object.values(GenderEnum)}),
    new InputField({title: 'Date of Birth', field: 'dateOfBirth', type: InputType.DATE, required: true, value: new Date().toJSON(), validationRegex: DATE_REGEX, validationMessage: 'Required, Age must be 13-18.' }),
];

//SIGNUP all other roles
export const SIGNUP_PROFILE_FIELDS:InputField[] = [    
    new InputField({title: 'Account Type', field: 'userRole', type: InputType.SELECT_LIST, required: true, selectOptionList: Object.values(RoleEnum)}),
    new InputField({title: 'New Account Token', field: 'token', type: InputType.TEXT, required: true}),
    ...SIGNUP_PROFILE_FIELDS_STUDENT,
];

export const EDIT_PROFILE_FIELDS_ADMIN:InputField[] = [    
    new InputField({title: 'Account Type', field: 'userRole', type: InputType.SELECT_LIST, required: true, selectOptionList: Object.values(RoleEnum)}),
    new InputField({title: 'Active Account', field: 'isActive', required: true, type: InputType.SELECT_LIST, selectOptionList: ['TRUE', 'FALSE']}),
    ...EDIT_PROFILE_FIELDS,
    new InputField({title: 'Walk Level', field: 'walkLevel', required: true, type: InputType.SELECT_LIST, selectOptionList: ['1','2','3','4','5','6','7','8','9','10']}),
    new InputField({title: 'Profile Notes', field: 'notes', type: InputType.PARAGRAPH, validationRegex: new RegExp(/.{0,3000}/), validationMessage: 'Max 3000 characters.'}),
];
