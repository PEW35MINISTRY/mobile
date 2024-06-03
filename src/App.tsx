import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from "react";
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { RootSiblingParent } from 'react-native-root-siblings';

import EditProfile from "./1-Profile/Edit-Profile";
import Login from "./1-Profile/Login";
import Signup from "./1-Profile/Signup";
import { CircleSearch } from './2-Circles/CircleSearch';
import { CircleDisplay } from './2-Circles/CircleDisplay';
import { CircleList } from './2-Circles/CircleList';
import PrayerRequestDisplay from './3-Prayer-Request/PrayerRequestDisplay';
import PrayerRequestList from './3-Prayer-Request/PrayerRequestList';
import store, { RootState } from './redux-store';
import theme from './theme';
import { AppStackParamList, ROUTE_NAMES } from './TypesAndInterfaces/routes';
import { AppTabNavigator } from './Widgets/navigation/AppTabNavigator';
import InitialAccountFlow from './1-Profile/InitialAccountFlow';
import AnimatedLogo from './Widgets/AnimatedLogo/AnimatedLogo';

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const CircleTabNavigatorOptions = {
  headerShown: false,
}

// Handle all react navigation for Circle Screens
const CircleStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_LIST_ROUTE_NAME} component={CircleList} />
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME} component={CircleDisplay} />
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME} component={CircleSearch} />
    </Stack.Navigator>
  )
}

// Handle all react navigation for Prayer Request screens
const PrayerRequestStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROUTE_NAMES.PRAYER_REQUEST_LIST_ROUTE_NAME} component={PrayerRequestList} />
        <Stack.Screen name={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME} component={PrayerRequestDisplay} />
    </Stack.Navigator>
  )
}

// Handle all react navigation for Content screens
const ContentNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="CONTENT_DEFAULT" component={EditProfile} />
    </Stack.Navigator>
  )
}

// Handle all react navigation for Settings screens
const SettingsStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTE_NAMES.EDIT_PROFILE_ROUTE_NAME} component={EditProfile} />
    </Stack.Navigator>
  )
}

// Renders navigation buttons at bottom of screen. Each screen in the navigator should be a stack navigator 
const BottomTabNavigator = () => {
  return (
      <Tab.Navigator screenOptions={CircleTabNavigatorOptions}
          tabBar={props => <AppTabNavigator {...props} />}
      >
  
        <Tab.Screen name={ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME} component={CircleStackNavigatorProp} />
        <Tab.Screen name={ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME} component={PrayerRequestStackNavigatorProp} />
        <Tab.Screen name={ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME} component={ContentNavigatorProp} />
        <Tab.Screen name={ROUTE_NAMES.PROFILE_SETTINGS_NAVIGATOR_ROUTE_NAME} component={SettingsStackNavigatorProp} />
      
      </Tab.Navigator>
  );
}

const App = ():JSX.Element => {

  return (
    <Provider store = { store }>
      <RootSiblingParent>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name={ROUTE_NAMES.LOGIN_ROUTE_NAME} component={Login} />
            <Stack.Screen name={ROUTE_NAMES.SIGNUP_ROUTE_NAME} component={Signup} />
            <Stack.Screen name={ROUTE_NAMES.INITIAL_ACCOUNT_FLOW_ROUTE_NAME} component={InitialAccountFlow} />
            <Stack.Screen name={ROUTE_NAMES.LOGO_ANIMATION_ROUTE_NAME} component={AnimatedLogo} />
            <Stack.Screen name={ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME} component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </RootSiblingParent>

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