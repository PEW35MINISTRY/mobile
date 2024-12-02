import type { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { DOMAIN, NEW_PARTNER_REQUEST_TIMEOUT, SETTINGS_VERSION } from '@env';
import keychain, { UserCredentials } from 'react-native-keychain'
import { configureStore, createAction, createReducer, createSlice } from '@reduxjs/toolkit';
import React, { act, useState } from 'react';
import { PartnerListItem, ProfileListItem, ProfileResponse } from './TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { PrayerRequestListItem } from './TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { CircleListItem } from './TypesAndInterfaces/config-sync/api-type-sync/circle-types';
import { BOTTOM_TAB_NAVIGATOR_ROUTE_NAMES, ROUTE_NAMES } from './TypesAndInterfaces/routes';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { LoginResponseBody } from './TypesAndInterfaces/config-sync/api-type-sync/auth-types';
import { ServerErrorResponse } from './TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import { Notifications, Registered, RegistrationError, NotificationCompletion } from 'react-native-notifications';

/******************************
   Account | Credentials Redux Reducer
*******************************/

export type AccountState = {
  userID: number,
  jwt: string, 
  userProfile: ProfileResponse,
}

const initialAccountState:AccountState = {
  userID: -1,
  jwt: '',
  userProfile: {} as ProfileResponse
}; 

const accountSlice = createSlice({
  name: 'account',
  initialState: initialAccountState,
  reducers: {
    setAccount: (state, action:PayloadAction<AccountState>) => state = action.payload,
    resetAccount: () => initialAccountState,
    updateJWT: (state, action:PayloadAction<string>) => state = {...state, jwt: action.payload},
    resetJWT: (state) => state = {...state, jwt: ''},
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
  },
});

// Export action functions to use in app with dispatch
// How to use in component: https://redux-toolkit.js.org/tutorials/quick-start#use-redux-state-and-actions-in-react-components
export const { setAccount, resetAccount, updateJWT, updateProfile, updateProfileImage, 
      addMemberCircle, removeMemberCircle, addInviteCircle, removeInviteCircle, addRequestedCircle, removeRequestedCircle,
      addPartner, removePartner, addPartnerPendingUser, removePartnerPendingUser, addPartnerPendingPartner, removePartnerPendingPartner, 
      addContact, removeContact, setContacts, addOwnedPrayerRequest, removeOwnedPrayerRequest, updateWalkLevel
    } = accountSlice.actions;

  export const saveJWTMiddleware:Middleware = store => next => action => {
    const result = next(action);

    if(action.type === setAccount.type || action.type === updateJWT.type) {
      keychain.setGenericPassword('jwt', store.getState().account.jwt, {service: "jwt"});
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
const addListItem = <T, K extends keyof ProfileResponse>(state:AccountState, action:PayloadAction<T>, listKey:K):AccountState => ({
  ...state, userProfile: { ...state.userProfile,
    [listKey]: [action.payload, ...(state.userProfile[listKey] || []) as T[]]
  }});

const removeListItem = <T, K extends keyof ProfileResponse>(state:AccountState, action:PayloadAction<number>, listKey:K, idKey:keyof T):AccountState => ({
  ...state, userProfile: { ...state.userProfile,
    [listKey]: (state.userProfile[listKey] as T[] || []).filter((item:T) => item[idKey] !== action.payload)
  }});

/**********************************************************
 * REDUX MIDDLEWARE: for non-static/async state operations
 **********************************************************/

//Custom Redux (Static) Middleware: https://redux.js.org/tutorials/fundamentals/part-6-async-logic
//Called directly in index.tsx: store.dispatch(initializeAccountState); 
export const initializeAccountState = async(dispatch: (arg0: { payload: AccountState; type: 'account/setAccount'; }|{type: 'account/resetAccount'; }) => void, getState: () => any):Promise<boolean> => { 

  // Request permissions on iOS, refresh token on Android
  Notifications.registerRemoteNotifications();

  Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
      // TODO: Send the token to my server so it could send back push notifications...
      console.log("Device Token Received", event.deviceToken);
  });
  Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
      console.error(event);
  });

  Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion: (response: NotificationCompletion) => void) => {
    console.log("Notification Received - Foreground", notification.payload);

    // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
    completion({alert: true, sound: true, badge: true});
      });

  Notifications.events().registerNotificationOpened((notification: Notification, completion: () => void, action: NotificationActionResponse) => {
    console.log("Notification opened by device user", notification.payload);
    console.log(`Notification opened with an action identifier: ${action.identifier} and response text: ${action.text}`);
    completion();
      });
      
  Notifications.events().registerNotificationReceivedBackground((notification: Notification, completion: (response: NotificationCompletion) => void) => {
    console.log("Notification Received - Background", notification.payload);

    Notifications.postLocalNotification(notification, notification.payload.message_id)

    // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
    completion({alert: true, sound: true, badge: true});
      });

  const storedJWT:boolean | UserCredentials = await keychain.getGenericPassword({service: "jwt"});
  const jwt = storedJWT ? storedJWT.password : '';

  if(jwt === undefined || jwt === '') {
    return false;
  }

  //Login via JWT
  try {
    const response:AxiosResponse = await axios.post(`${DOMAIN}/api/authenticate`, {}, { headers: { jwt }});
    const account:AccountState = {
      jwt: response.data.jwt,
      userID: response.data.userID,
      userProfile: response.data.userProfile,
    };

    //Save to Redux for current session
    dispatch(setAccount(account));
    return true;
  }
  catch {console.log("Auto attempt failed to Re-login with cached authentication"); return false} 
  
}

/*****************************************
   SETTINGS | Redux Reducer
   Temporary - for current session only
******************************************/

export type SettingsState = {
  version:number, //Settings version to indicate local storage reset
  skipAnimation:boolean,
  lastNewPartnerRequest:number|undefined, //timestamp
}

const initialSettingsState:SettingsState = {
  version: parseInt(SETTINGS_VERSION ?? '1', 10),
  skipAnimation: false,
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
    resetLastNewPartnerRequest: (state) => state = {...state, lastNewPartnerRequest: undefined},    
  },
});

//Export Dispatch Actions
export const { setSettings, resetSettings, setSkipAnimation, 
    setLastNewPartnerRequest, resetLastNewPartnerRequest, clearSettings
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
          dispatch(setSettings({...initialSettingsState, ...savedSettings}));
          return false;
        }
    } catch (error) {
        console.error('REDUX Settings | localStorage initialization failed: ', error);
        dispatch(resetSettings());
        return false;
    }
};

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

const store = configureStore({
    reducer: {
      account: accountSlice.reducer,
      navigationTab: tabSlice.reducer,
      settings: settingsSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saveJWTMiddleware, saveSettingsMiddleware),
});

export default store;


//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch