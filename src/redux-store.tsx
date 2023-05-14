import React from 'react';
import { ToastStyle, serverErrorResponse, ProfileResponse } from './TypesAndInterfaces/app-types';
import { configureStore, createReducer, createAction, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit';

/******************************
   Account | Credentials Redux Reducer
*******************************/

const initialAccountState = {
  userId: 0,
  JWT: '',
  userProfile: {} as ProfileResponse
}; 

const slice = createSlice({
  name: 'slice',
  initialState: initialAccountState,
  reducers: {
    authenticate: (state, action:PayloadAction<string>) => state,
    loadLogin: (state, action:PayloadAction<string>) => {initialAccountState},
    saveLogin: (state, action:PayloadAction<string>) => {action.payload},
    login: (state, action:PayloadAction<string>) => state,
    logout: (state, action:PayloadAction<string>) => {initialAccountState},
    resetLogin: (state, action:PayloadAction<string>) => {initialAccountState},
    default: (state, action:PayloadAction<string>) => state,
  },
});

const store = configureStore({
    reducer: {
      account: slice.reducer,
  },
});

export default store;

//Auto Authenticate JWT
store.dispatch({type: "load-login", payload: {}});

//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch