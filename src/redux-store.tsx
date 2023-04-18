import React from 'react';
import {createStore, combineReducers} from 'redux';
import { ToastStyle, serverErrorResponse, ProfileResponse } from './TypesAndInterfaces/app-types';


/******************************
   Account | Credentials Redux Reducer
*******************************/

const initialAccountState = {
  userId: 0,
  JWT: '',
  userProfile: {} as ProfileResponse
}; 

const accountReducer = (state = initialAccountState, action: { type: string; payload: any; }) => { 
  switch(action.type) {
   
/* Verify cached JWT | auto login   */
    case 'authenticate':
      return state;

/* Logging Out User   */
      case 'load-login':
        return {...initialAccountState};

/* Save Payload to Account State | complete replace   */
    case 'save-login': 
      return {...action.payload};

/* Logging In User   */
    case 'login':
          // window.localStorage.setItem('user', JSON.stringify(userPayload));
          // window.location.assign('/portal/dashboard');
          // store.dispatch({type: "save-login", payload: userPayload});
        return state;

  /* Logging Out User   */
      case 'logout':
        return {...initialAccountState};

/* Resetting Account State to defaults */
      case 'reset-login':
        return {...initialAccountState};

    default: return state; 
  }
}


//Redux Store
const allStateDomains = combineReducers({
  account: accountReducer,
});

const store = createStore(allStateDomains,{});

export default  store;

//Auto Authenticate JWT
store.dispatch({type: "load-login", payload: {}});

//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch