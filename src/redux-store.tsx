import { Platform } from 'react-native';
import keychain, { UserCredentials } from 'react-native-keychain';
import { configureStore, createSlice, type Middleware, type PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { DOMAIN, SETTINGS_VERSION } from '@env';
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES } from './TypesAndInterfaces/routes';
import { PartnerListItem, ProfileListItem, ProfileResponse } from './TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { PrayerRequestListItem } from './TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { CircleListItem } from './TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { ServerErrorResponse } from './TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import { DeviceVerificationResponseType } from './TypesAndInterfaces/config-sync/api-type-sync/notification-types';
import { generateDefaultDeviceName } from './utilities/notifications';



/******************************
   Account | Credentials Redux Reducer
*******************************/

interface AccountStateRequired {
  userID: number,
  jwt: string, 
  userProfile: ProfileResponse,
}

export interface AccountState extends AccountStateRequired {
  answeredPrayerRequestList: PrayerRequestListItem[],
}

const initialAccountState:AccountState = {
  userID: -1,
  jwt: '',
  userProfile: {} as ProfileResponse,
  answeredPrayerRequestList: [],
}; 

const accountSlice = createSlice({
  name: 'account',
  initialState: initialAccountState,
  reducers: {
    setAccount: (state, action:PayloadAction<AccountStateRequired>) => state = {...initialAccountState, ...action.payload},
    resetAccount: () => initialAccountState,
    updateJWT: (state, action:PayloadAction<string>) => state = {...state, jwt: action.payload},
    clearJWT: (state) => state = {...state, jwt: ''},
    updateProfile: (state, action:PayloadAction<ProfileResponse>) => state = {...state, userProfile: action.payload},
    updateProfileImage: (state, action:PayloadAction<string|undefined>) => state = {...state, userProfile: {...state.userProfile, image: action.payload}},
    updateWalkLevel: (state, action:PayloadAction<number>) => state = {...state, userProfile: {...state.userProfile, walkLevel: action.payload}},

    addMemberCircle: (state, action:PayloadAction<CircleListItem>) => state = addListItem(state, action, 'circleList'),
    removeMemberCircle: (state, action:PayloadAction<number>) => state = removeListItem(state, action, 'circleList', 'circleID'),
    addRequestedCircle: (state, action:PayloadAction<CircleListItem>) => state = addListItem(state, action, 'circleRequestList'),
    removeRequestedCircle: (state, action:PayloadAction<number>) => state = removeListItem(state, action, 'circleRequestList', 'circleID'),
    addInviteCircle: (state, action:PayloadAction<CircleListItem>) => state = addListItem(state, action, 'circleInviteList'),
    removeInviteCircle: (state, action:PayloadAction<number>) => state = removeListItem(state, action, 'circleInviteList', 'circleID'),

    addPartner: (state, action: PayloadAction<PartnerListItem>) => state = addListItem(state, action, 'partnerList'),
    removePartner: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'partnerList', 'userID'),
    addPartnerPendingUser: (state, action: PayloadAction<PartnerListItem>) => state = addListItem(state, action, 'partnerPendingUserList'),
    removePartnerPendingUser: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'partnerPendingUserList', 'userID'),
    addPartnerPendingPartner: (state, action: PayloadAction<PartnerListItem>) => state = addListItem(state, action, 'partnerPendingPartnerList'),
    removePartnerPendingPartner: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'partnerPendingPartnerList', 'userID'),

    addContact: (state, action: PayloadAction<ProfileListItem>) => state = addListItem(state, action, 'contactList'),
    removeContact: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'contactList', 'userID'),
    setContacts: (state, action: PayloadAction<ProfileListItem[]>) => state = {...state, userProfile: {...state.userProfile, contactList: action.payload}},

    addOwnedPrayerRequest: (state, action:PayloadAction<PrayerRequestListItem>) => state = addListItem(state, action, 'ownedPrayerRequestList'),
    removeOwnedPrayerRequest: (state, action:PayloadAction<number>) => state = removeListItem(state, action, 'ownedPrayerRequestList', 'prayerRequestID'),
    setOwnedPrayerRequests: (state, action:PayloadAction<PrayerRequestListItem[]>) => state = {...state, userProfile: {...state.userProfile, ownedPrayerRequestList: action.payload}},
    removeExpiringPrayerRequest: (state, action:PayloadAction<number>) => state = removeListItem(state, action, 'expiringPrayerRequestList', 'prayerRequestID'),
        
    //Not apart of userProfile | answeredPrayerRequestList are fetched and saved in PrayerRequestList
    setAnsweredPrayerRequestList: (state, action:PayloadAction<PrayerRequestListItem[]>) => state = {...state, answeredPrayerRequestList: action.payload},
    removeAnsweredPrayerRequest: (state, action:PayloadAction<number>) => state = removeListItem(state, action, 'answeredPrayerRequestList', 'prayerRequestID'),
    addAnsweredPrayerRequest: (state, action:PayloadAction<PrayerRequestListItem>) => state = addListItem(state, action, 'answeredPrayerRequestList'),
  },
});

// Export action functions to use in app with dispatch
// How to use in component: https://redux-toolkit.js.org/tutorials/quick-start#use-redux-state-and-actions-in-react-components
export const { setAccount, resetAccount, updateJWT, clearJWT, updateProfile, updateProfileImage, updateWalkLevel,
      addMemberCircle, removeMemberCircle, addInviteCircle, removeInviteCircle, addRequestedCircle, removeRequestedCircle,
      addPartner, removePartner, addPartnerPendingUser, removePartnerPendingUser, addPartnerPendingPartner, removePartnerPendingPartner, removeExpiringPrayerRequest,
      addOwnedPrayerRequest, removeOwnedPrayerRequest, setOwnedPrayerRequests,
      addContact, removeContact, setContacts, 

      setAnsweredPrayerRequestList, addAnsweredPrayerRequest, removeAnsweredPrayerRequest
    } = accountSlice.actions;

  export const saveJWTMiddleware:Middleware = store => next => action => {
    const result = next(action);

    if(action.type === setAccount.type || action.type === updateJWT.type) {
      keychain.setGenericPassword('jwt', store.getState().account.jwt, {service: "jwt"});
    }
    else if(action.type === clearJWT.type) {
      keychain.setGenericPassword('jwt', "12345", {service: "jwt"});
    }

    return result;
};

/******************************
   App Tab Navigation | Tab Redux Reducer
*******************************/

export type tabState = {
  focusedTab: BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES
}

const initialTabState:tabState = {
  focusedTab: BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME
}

const tabSlice = createSlice({
  name: "tabs",
  initialState: initialTabState,
  reducers: {
    setTabFocus: (state, action:PayloadAction<BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES>) => state = {focusedTab: action.payload}
  }
});

export const { setTabFocus } = tabSlice.actions;

//List Utilities
const addListItem = <T, K extends keyof ProfileResponse | 'answeredPrayerRequestList'>(state:AccountState, action:PayloadAction<T>, listKey:K):AccountState => {
    if(listKey === 'answeredPrayerRequestList')
        return { ...state, answeredPrayerRequestList: [action.payload as PrayerRequestListItem, ...(state.answeredPrayerRequestList ?? [])] };
    
    else
        return { ...state, userProfile: { ...state.userProfile, [listKey]: [action.payload, ...(state.userProfile[listKey as keyof ProfileResponse] as T[] ?? [])] }};
}

const removeListItem = <T, K extends keyof ProfileResponse | 'answeredPrayerRequestList'>(state:AccountState, action:PayloadAction<number>, listKey:K, idKey:keyof T | keyof PrayerRequestListItem):AccountState => {
    if(listKey === 'answeredPrayerRequestList')
        return { ...state, answeredPrayerRequestList: (state.answeredPrayerRequestList ?? []).filter((item:PrayerRequestListItem) => item[idKey as keyof PrayerRequestListItem] !== action.payload) };

    else
        return { ...state, userProfile: { ...state.userProfile, [listKey]: ((state.userProfile[listKey as keyof ProfileResponse] as T[]) ?? []).filter((item: T) => item[idKey as keyof T] !== action.payload) }};
}

/**********************************************************
 * REDUX MIDDLEWARE: for non-static/async state operations
 **********************************************************/

//Custom Redux (Static) Middleware: https://redux.js.org/tutorials/fundamentals/part-6-async-logic
//Called directly in index.tsx: store.dispatch(initializeAccountState); 
export const initializeAccountState = async(dispatch:(arg0: { payload:AccountStateRequired; type:'account/setAccount'; }|{type:'account/resetAccount'; }) => void, getState: () => any):Promise<boolean> => { 

  const storedJWT:boolean | UserCredentials = await keychain.getGenericPassword({service: "jwt"});
  const jwt = storedJWT ? storedJWT.password : '';

  if(jwt === undefined || jwt === '') {
    return false;
  }

  //Login via JWT
  try {
    const response:AxiosResponse = await axios.post(`${DOMAIN}/api/authenticate`, {}, { headers: { jwt }});
    const account:AccountStateRequired = {
      jwt: response.data.jwt,
      userID: response.data.userID,
      userProfile: response.data.userProfile,
    };

    //Save to Redux for current session
    dispatch(setAccount(account));
    return true;
  }
  catch {return false} 
  
}

/*****************************************
   SETTINGS | Redux Reducer
   Temporary - for current session only
******************************************/

export type SettingsState = {
  version:number, //Settings version to indicate local storage reset
  skipAnimation:boolean,
  deviceID: number,
  lastNewPartnerRequest:number|undefined, //timestamp
}

const initialSettingsState:SettingsState = {
  version: parseInt(SETTINGS_VERSION ?? '1', 10),
  skipAnimation: false,
  deviceID: -1,
  lastNewPartnerRequest: undefined,
};

//Use as default; but don't save to local storage
export const DEFAULT_LAST_NEW_PARTNER_REQUEST:number = Date.now() - parseInt(process.env.REACT_APP_NEW_PARTNER_TIMEOUT ?? '3600000', 10);  //1 hour ago
 
const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
  reducers: {
    setSettings: (state, action:PayloadAction<SettingsState>) => state = {...action.payload},
    resetSettings: () => initialSettingsState,
    clearSettings: () => initialSettingsState,
    setSkipAnimation: (state, action:PayloadAction<boolean>) => state = {...state, skipAnimation: action.payload},
    setLastNewPartnerRequest: (state) => state = {...state, lastNewPartnerRequest: Date.now()},
    setDeviceID: (state, action:PayloadAction<number>) => state = {...state, deviceID: action.payload},
    resetLastNewPartnerRequest: (state) => state = {...state, lastNewPartnerRequest: undefined},    
  },
});

//Export Dispatch Actions
export const { setSettings, resetSettings, setSkipAnimation, 
    setLastNewPartnerRequest, resetLastNewPartnerRequest, clearSettings, setDeviceID
} = settingsSlice.actions;


export const initializeSettingsState = async(dispatch: (arg0: { payload: SettingsState; type: 'settings/setSettings'; }|{type: 'settings/resetSettings'; }) => void, getState: () => any):Promise<boolean> => {
    try {
        const userID = store.getState().account.userID.toString();
        const localStorageSettings:boolean | UserCredentials = await keychain.getGenericPassword({service: userID});
        const savedSettings:SettingsState = localStorageSettings ? JSON.parse(localStorageSettings.password) : initialSettingsState;
        if(!isNaN(savedSettings.version) && (savedSettings.version == parseInt(SETTINGS_VERSION ?? '1'))) {
          dispatch(setSettings(savedSettings));
          return savedSettings.skipAnimation;
        }
        else {
          console.warn("Invalid settings configuration, or settings version changed.");
          dispatch(setSettings({...initialSettingsState, ...savedSettings, version: parseInt(SETTINGS_VERSION ?? '1')}));
          return false;
        }
    } catch (error) {
        console.error('REDUX Settings | localStorage initialization failed: ', error);
        dispatch(resetSettings());
        return false;
    }
};

export const registerNotificationDevice = async(dispatch: (arg0: { payload: number, type: 'settings/setDeviceID'; }) => void, getState: () => any):Promise<void> => {
  const reduxState = getState();
  const userID = reduxState.account.userID;
  const deviceID = reduxState.settings.deviceID;
  const jwt = reduxState.account.jwt;
  const deviceToken = reduxState.deviceToken;

  if (deviceID === -1) {
    const response:AxiosResponse<string> = await axios.post(`${DOMAIN}/api/user/${userID}/notification/device`, {deviceToken: deviceToken, deviceName: generateDefaultDeviceName(), deviceOS: Platform.OS.toUpperCase()}, { headers: { jwt }});
    const responseDeviceID = parseInt(response.data);
    if (responseDeviceID !== deviceID) dispatch(setDeviceID(responseDeviceID));
  } else {
      await axios.post(`${DOMAIN}/api/user/${userID}/notification/device/${deviceID}/verify`, {deviceToken: deviceToken}, { headers: { jwt }}).catch((error:AxiosError<ServerErrorResponse>) => {
        if (error.response?.data.notification === DeviceVerificationResponseType.DELETED) { 
          dispatch(setDeviceID(-1));
          store.dispatch(registerNotificationDevice);
        }
      })
  }
}

export const saveSettingsMiddleware:Middleware = store => next => action => {
  const result = next(action);

  if(Object.values(settingsSlice.actions).map(action => action.type).includes(action.type) && action.type !== resetSettings.type) {
    const storeRef = store.getState();
    const settingsState: RootState['settings'] = storeRef.settings;
    keychain.setGenericPassword('settings', JSON.stringify(settingsState), {service: storeRef.account.userID.toString()});

  } else if(action.type === resetSettings.type) {
    const storeRef = store.getState();
    keychain.setGenericPassword('settings', JSON.stringify(initialSettingsState), {service: storeRef.account.userID.toString()});
  }
  return result;
};

const deviceTokenSlice = createSlice({
  name: 'deviceToken',
  initialState: '',
  reducers: {
    setDeviceToken: (state, action:PayloadAction<string>) => state = action.payload
  }
});

export const { setDeviceToken } = deviceTokenSlice.actions;

const store = configureStore({
    reducer: {
      account: accountSlice.reducer,
      navigationTab: tabSlice.reducer,
      settings: settingsSlice.reducer,
      deviceToken: deviceTokenSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saveJWTMiddleware, saveSettingsMiddleware),
});

export default store;


//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch