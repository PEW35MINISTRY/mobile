import React, {useState, useEffect, useContext, useRef} from "react";
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert} from 'react-native';
import theme from './theme';
import { Provider } from 'react-redux';
import store from './redux-store';
import { useAppSelector, useAppDispatch } from './TypesAndInterfaces/hooks';

import Login from "./1-Profile/Login";

const App = ():JSX.Element => {

 
  return (
    <Provider store = { store }>
      <View style={theme.center}>
        <Login />
      </View>
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