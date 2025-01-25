import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, StackCardInterpolationProps } from '@react-navigation/stack';
import React, { useEffect } from "react";
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { RootSiblingParent } from 'react-native-root-siblings';

import EditProfile from "./1-Profile/Edit-Profile";
import Login from "./0-Pages/Login";
import Signup from "./1-Profile/Signup";
import { CircleSearch } from './2-Circles/CircleSearch';
import { CircleDisplay } from './2-Circles/CircleDisplay';
import { CircleList } from './2-Circles/CircleList';
import PrayerRequestDisplay from './3-Prayer-Request/PrayerRequestDisplay';
import PrayerRequestList from './3-Prayer-Request/PrayerRequestList';
import ContentDisplay from './5-Content/ContentDisplay';
import store, { RootState } from './redux-store';
import { AppStackParamList, ROUTE_NAMES } from './TypesAndInterfaces/routes';
import { AppTabNavigator } from './Widgets/navigation/AppTabNavigator';
import InitialAccountFlow from './1-Profile/InitialAccountFlow';
import ProfileSettings from './0-Pages/Settings';
import AnimatedLogo from './0-Pages/AnimatedLogo';
import DashboardDisplay from './10-Dashboard/DashboardDisplay';
import OfflineWarning from './0-Pages/OfflineWarning';
import { initializeAppUtils } from './utilities/utilities';

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();
export const navigationRef = React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>();

const CircleTabNavigatorOptions = {
  headerShown: false,
}

const forFade = (props:StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: props.current.progress
  }
})

const DashboardStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROUTE_NAMES.DASHBOARD_ROUTE_NAME} component={DashboardDisplay} />
        <Stack.Screen name={ROUTE_NAMES.EDIT_PROFILE_ROUTE_NAME} component={EditProfile} />
        <Stack.Screen name={ROUTE_NAMES.PROFILE_SETTINGS_ROUTE_NAME} component={ProfileSettings} />
        <Stack.Screen name={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME} component={PrayerRequestDisplay} key={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME + "Dashboard"}/>
    </Stack.Navigator>
  )
}

const CircleStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_LIST_ROUTE_NAME} component={CircleList} />
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME} component={CircleDisplay} />
      <Stack.Screen name={ROUTE_NAMES.CIRCLE_SEARCH_ROUTE_NAME} component={CircleSearch} />
      <Stack.Screen name={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME} component={PrayerRequestDisplay} key={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME + "Circle"}/>
    </Stack.Navigator>
  )
}

// Handle all react navigation for Prayer Request screens
const PrayerRequestStackNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROUTE_NAMES.PRAYER_REQUEST_LIST_ROUTE_NAME} component={PrayerRequestList} />
        <Stack.Screen name={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME} component={PrayerRequestDisplay} key={ROUTE_NAMES.PRAYER_REQUEST_DISPLAY_ROUTE_NAME + "PrayerRequestStack"}/>
    </Stack.Navigator>
  )
}

// Handle all react navigation for Content screens
const ContentNavigatorProp = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROUTE_NAMES.CONTENT_ROUTE_NAME} component={ContentDisplay} />
    </Stack.Navigator>
  )
}


// Renders navigation buttons at bottom of screen. Each screen in the navigator should be a stack navigator 
const BottomTabNavigator = () => {
  return (
      <Tab.Navigator screenOptions={CircleTabNavigatorOptions}
          tabBar={props => <AppTabNavigator {...props} />}
      >
  
        <Tab.Screen name={ROUTE_NAMES.DASHBOARD_NAVIGATOR_ROUTE_NAME} component={DashboardStackNavigatorProp} />
        <Tab.Screen name={ROUTE_NAMES.CIRCLE_NAVIGATOR_ROUTE_NAME} component={CircleStackNavigatorProp} />
        <Tab.Screen name={ROUTE_NAMES.PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME} component={PrayerRequestStackNavigatorProp} />
        <Tab.Screen name={ROUTE_NAMES.CONTENT_NAVIGATOR_ROUTE_NAME} component={ContentNavigatorProp} />
      
      </Tab.Navigator>
  );
}

const App = ():JSX.Element => {

  useEffect(() => {
    initializeAppUtils();
  }, []);

  return (
    <Provider store = { store }>
      <RootSiblingParent>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name={ROUTE_NAMES.LOGIN_ROUTE_NAME} component={Login} />
            <Stack.Screen name={ROUTE_NAMES.SIGNUP_ROUTE_NAME} component={Signup} />
            <Stack.Screen name={ROUTE_NAMES.INITIAL_ACCOUNT_FLOW_ROUTE_NAME} component={InitialAccountFlow} />
            <Stack.Screen name={ROUTE_NAMES.LOGO_ANIMATION_ROUTE_NAME} component={AnimatedLogo} />
            <Stack.Screen name={ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME} component={BottomTabNavigator} options={{cardStyleInterpolator: forFade}}/>
            <Stack.Screen name={ROUTE_NAMES.OFFLINE_WARNING_ROUTE_NAME} component={OfflineWarning} />
          </Stack.Navigator>
        </NavigationContainer>
      </RootSiblingParent>

    </Provider>
  );
}

export default App;
