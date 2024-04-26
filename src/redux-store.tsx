import type { PayloadAction } from '@reduxjs/toolkit';
import { configureStore, createAction, createReducer, createSlice } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { ProfileListItem, ProfileResponse } from './TypesAndInterfaces/config-sync/api-type-sync/profile-types';
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
    addPrayerRequest: (state, action:PayloadAction<PrayerRequestListItem>) => state = {...state, userProfile: {...state.userProfile, prayerRequestList: [action.payload, ...(state.userProfile.prayerRequestList || []) as PrayerRequestListItem[]]}},
    removePrayerRequest: (state, action:PayloadAction<number>) => state = {...state, userProfile: {...state.userProfile, prayerRequestList: [...(state.userProfile.prayerRequestList || []) as PrayerRequestListItem[]].filter(prayerRequest => prayerRequest.prayerRequestID !== action.payload)}},
    updatePrayerRequest: (state, action:PayloadAction<PrayerRequestListItem>) => state = {...state, userProfile: {...state.userProfile, prayerRequestList: state.userProfile.prayerRequestList?.map((prayerRequest:PrayerRequestListItem) => prayerRequest.prayerRequestID == action.payload.prayerRequestID ? action.payload : prayerRequest)}}
  },
});

const store = configureStore({
    reducer: {
      account: slice.reducer
    }
});

export default store;

// Export action functions to use in app with dispatch
// How to use in component: https://redux-toolkit.js.org/tutorials/quick-start#use-redux-state-and-actions-in-react-components
export const { setAccount, resetAccount, updateJWT, updateProfile, updateProfileImage, addMemberCircle, removeMemberCircle, addRequestedCircle, removeRequestedCircle, addInviteCircle, removeInviteCircle, addPrayerRequest, removePrayerRequest, updatePrayerRequest } = slice.actions;

//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch