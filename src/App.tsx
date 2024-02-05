import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from "react";
import { Alert, FlatList, Image, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import EditProfile from "./1-Profile/Edit-Profile";
import Login from "./1-Profile/Login";
import Signup from "./1-Profile/Signup";
import { CircleSearch } from './2-Circles/CircleSearch';
import CircleDisplay from './2-Circles/CircleDisplay';
import { CircleList } from './2-Circles/CircleList';

import { useAppDispatch, useAppSelector } from './TypesAndInterfaces/hooks';
import store, { RootState } from './redux-store';
import theme from './theme';
import { AppStackParamList, ROUTE_NAMES } from './TypesAndInterfaces/routes';
import { CircleTabNavigator } from './2-Circles/circle-widgets';

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const CircleTabNavigatorOptions = {
  headerShown: false,
}

// Handle all react navigation screens for circles
const CircleStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_LIST_ROUTE_NAME} component={CircleList} />
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME} component={CircleDisplay} />
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME} component={CircleSearch} />
    </Stack.Navigator>
  )
}

// Renders navigation buttons at bottom of screen. Each screen in the navigator should be a stack navigator 
const BottomTabNavigator = () => {
  return (
      <Tab.Navigator screenOptions={CircleTabNavigatorOptions}
          tabBar={props => <CircleTabNavigator {...props} />}
      >
        <Tab.Screen name={ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME} component={CircleStackNavigatorProp} />

      </Tab.Navigator>
  );
}

const App = ():JSX.Element => {

  return (
    <Provider store = { store }>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name={ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME} component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  ...theme,
  img: {
    width: 200,
    height: 200,
    borderRadius: 50,
    margin: 'auto',
  },
});

export default App;