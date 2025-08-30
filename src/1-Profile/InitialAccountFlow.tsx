import { DOMAIN } from "@env";
import axios from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Modal, SafeAreaView } from "react-native";
import { CALLBACK_STATE, StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState, } from "../redux-store";
import theme, { COLORS } from "../theme";
import ProfileImageSettings from "./ProfileImageSettings";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import NewPartner from "../0-Pages/NewPartner";

const InitialAccountFlow = ({navigation}:StackNavigationProps):JSX.Element => {

    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const [componentIndex, setComponentIndex] = useState<number>(0);
    
    const [accountInitComponents, setAccountInitComponents] = useState<JSX.Element[]>([
      <ProfileImageSettings 
        callback={(state) => changeAccountComponentIndex(state)} continueNavigation={true}
      />,
      <NewPartner callback={(state) => changeAccountComponentIndex(state)} />
    ]);

    const [componentsLength, setComponentsLength] = useState<number>(accountInitComponents.length);

    useEffect(() => {
      if (componentIndex >= componentsLength) {
        navigation.navigate(ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME);
      }

    }, [componentIndex])

    const changeAccountComponentIndex = (newState:CALLBACK_STATE) => {
      let change = 0;
      switch(newState) {
        case CALLBACK_STATE.SUCCESS:
        case CALLBACK_STATE.EXIT: 
          change = 1;
          break;
        case CALLBACK_STATE.FAILURE:
        case CALLBACK_STATE.BACK:
          change = -1;
      }

      setComponentIndex((val) => ((change === -1 && val > 0 ) || change === 1) ? val+change : val);
    }

    const renderSetupProp = () => {
      return (
        <Modal 
          visible={componentIndex < componentsLength}
          onRequestClose={() => setComponentIndex((val) => val+1)}
          animationType='slide'
          transparent={true}
        >
          {componentIndex < componentsLength && accountInitComponents[componentIndex]}
        </Modal>
      )
    }

    return (
        <SafeAreaView style={styles.backgroundView}>
            <View style={styles.backgroundView}>
                {renderSetupProp()}
             </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
      backgroundView: {
        backgroundColor: COLORS.black,
        flex: 1
      }
})

export default InitialAccountFlow;