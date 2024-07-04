import type { PayloadAction } from '@reduxjs/toolkit';
import { configureStore, createAction, createReducer, createSlice } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { PartnerListItem, ProfileListItem, ProfileResponse } from './TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { PrayerRequestListItem } from './TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { CircleListItem } from './TypesAndInterfaces/config-sync/api-type-sync/circle-types';


/******************************
   Account | Credentials Redux Reducer
*******************************/

export type AccountState = {
  userID: number,
  jwt: string, 
  userProfile: ProfileResponse,
}

const initialAccountState = {
  userID: -1,
  jwt: '',
  userProfile: {} as ProfileResponse
}; 

// createSlice creates a reducer and actions automatically
const slice = createSlice({
  name: 'slice',
  initialState: initialAccountState,
  reducers: {
    setAccount: (state, action:PayloadAction<AccountState>) => state = action.payload,
    resetAccount: () => initialAccountState,
    updateJWT: (state, action:PayloadAction<string>) => state = {...state, jwt: action.payload},
    updateProfile: (state, action:PayloadAction<ProfileResponse>) => state = {...state, userProfile: action.payload},
    updateProfileImage: (state, action:PayloadAction<string|undefined>) => state = {...state, userProfile: {...state.userProfile, image: action.payload}},
    
    addMemberCircle: (state, action:PayloadAction<CircleListItem>) => state = {...state, userProfile: {...state.userProfile, circleList: [action.payload, ...(state.userProfile.circleList || []) as CircleListItem[]]}},
    removeMemberCircle: (state, action:PayloadAction<number>) => state = {...state, userProfile: {...state.userProfile, circleList: [...(state.userProfile.circleList || []) as CircleListItem[]].filter(circle => circle.circleID !== action.payload)}},
    addRequestedCircle: (state, action:PayloadAction<CircleListItem>) => state = {...state, userProfile: {...state.userProfile, circleRequestList: [action.payload, ...(state.userProfile.circleRequestList || []) as CircleListItem[]]}},
    removeRequestedCircle: (state, action:PayloadAction<number>) => state = {...state, userProfile: {...state.userProfile, circleRequestList: [...(state.userProfile.circleRequestList || []) as CircleListItem[]].filter(circle => circle.circleID !== action.payload)}},
    addInviteCircle: (state, action:PayloadAction<CircleListItem>) => state = {...state, userProfile: {...state.userProfile, circleInviteList: [action.payload, ...(state.userProfile.circleInviteList || []) as CircleListItem[]]}},
    removeInviteCircle: (state, action:PayloadAction<number>) => state = {...state, userProfile: {...state.userProfile, circleInviteList: [...(state.userProfile.circleInviteList || []) as CircleListItem[]].filter(circle => circle.circleID !== action.payload)}},
    
    addPartner: (state, action: PayloadAction<PartnerListItem>) => state = addListItem(state, action, 'partnerList'),
    removePartner: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'partnerList', 'userID'),
    addPartnerPendingUser: (state, action: PayloadAction<PartnerListItem>) => state = addListItem(state, action, 'partnerPendingUserList'),
    removePartnerPendingUser: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'partnerPendingUserList', 'userID'),
    addPartnerPendingPartner: (state, action: PayloadAction<PartnerListItem>) => state = addListItem(state, action, 'partnerPendingPartnerList'),
    removePartnerPendingPartner: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'partnerPendingPartnerList', 'userID'),

    addContact: (state, action: PayloadAction<ProfileListItem>) => state = addListItem(state, action, 'contactList'),
    removeContact: (state, action: PayloadAction<number>) => state = removeListItem(state, action, 'contactList', 'userID'),

  },
});


// Export action functions to use in app with dispatch
// How to use in component: https://redux-toolkit.js.org/tutorials/quick-start#use-redux-state-and-actions-in-react-components
export const { setAccount, resetAccount, updateJWT, updateProfile, updateProfileImage, 
      addMemberCircle, removeMemberCircle, addInviteCircle, removeInviteCircle, addRequestedCircle, removeRequestedCircle,
      addPartner, removePartner, addPartnerPendingUser, removePartnerPendingUser, addPartnerPendingPartner, removePartnerPendingPartner, 
      addContact, removeContact
    } = slice.actions;


//List Utilities
const addListItem = <T, K extends keyof ProfileResponse>(state:AccountState, action:PayloadAction<T>, listKey:K):AccountState => ({
  ...state, userProfile: { ...state.userProfile,
    [listKey]: [action.payload, ...(state.userProfile[listKey] || []) as T[]]
  }});

const removeListItem = <T, K extends keyof ProfileResponse>(state:AccountState, action:PayloadAction<number>, listKey:K, idKey:keyof T):AccountState => ({
  ...state, userProfile: { ...state.userProfile,
    [listKey]: (state.userProfile[listKey] as T[] || []).filter((item:T) => item[idKey] !== action.payload)
  }});


const store = configureStore({
    reducer: {
      account: slice.reducer
    }
});

export default store;


//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch