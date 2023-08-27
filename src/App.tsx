import React, {useState, useEffect, useContext, useRef} from "react";
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import theme from './theme';
import { Provider } from 'react-redux';
import store from './redux-store';
import { useAppSelector, useAppDispatch } from './TypesAndInterfaces/hooks';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CircleTabNavigator } from "./widgets";
import Login from "./1-Profile/Login";
import Signup from "./1-Profile/Signup";
import EditProfile from "./1-Profile/Edit-Profile";
import Circles from "./2-Circles/Cirlces";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CircleTabNavigatorOptions = {
  headerShown: false,
}

const CircleTabNavigatorProp = () => {
  return (
      <Tab.Navigator screenOptions={CircleTabNavigatorOptions}
                     initialRouteName="Home"
                     tabBar={props => <CircleTabNavigator {...props} />}
      >
        <Tab.Screen name="Circles" component={Circles} />

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
            <Stack.Screen name="CircleNavigator" component={CircleTabNavigatorProp} />
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