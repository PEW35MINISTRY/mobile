import React from 'react';
import { ProfileResponse } from './TypesAndInterfaces/profile-types';
import { configureStore, createReducer, createAction, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit';

/******************************
   Account | Credentials Redux Reducer
*******************************/

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
    saveLogin: (state, action:PayloadAction<any>) => state = action.payload,
    resetLogin: (state) => state = initialAccountState,
    updateProfile: (state, action:PayloadAction<any>) => state = {...state, userProfile: action.payload},
    updateJWT: (state, action:PayloadAction<any>) => state = {...state, jwt: action.payload}
  }
});

const store = configureStore({
    reducer: {
      account: slice.reducer,
  },
});

export default store;

// Export action functions to use in app with dispatch
// How to use in component: https://redux-toolkit.js.org/tutorials/quick-start#use-redux-state-and-actions-in-react-components
export const { saveLogin, resetLogin, updateProfile, updateJWT } = slice.actions;

//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch