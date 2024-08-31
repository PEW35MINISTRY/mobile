import { DOMAIN } from "@env";
import axios from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Modal, SafeAreaView } from "react-native";
import { StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState, } from "../redux-store";
import theme, { COLORS } from "../theme";
import ProfileImageSettings from "./ProfileImageSettings";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import Partnerships from "../4-Partners/Partnerships";

const InitialAccountFlow = ({navigation}:StackNavigationProps):JSX.Element => {

    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const [componentIndex, setComponentIndex] = useState<number>(0);
    
    const [accountInitComponents, setAccountInitComponents] = useState<JSX.Element[]>([
      <ProfileImageSettings 
        callback={() => incrementAccountComponentIndex()}
      />,
      <Partnerships 
        callback={() => incrementAccountComponentIndex()} navigation={navigation} continueNavigation={true}
      />
    ]);

    const [componentsLength, setComponentsLength] = useState<number>(accountInitComponents.length);

    useEffect(() => {
      if (componentIndex >= componentsLength) {
        navigation.navigate(ROUTE_NAMES.BOTTOM_TAB_NAVIGATOR_ROUTE_NAME);
      }

    }, [componentIndex])

    const incrementAccountComponentIndex = () => {
      setComponentIndex((val) => val+1);
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
        <SafeAreaView style={styles.center}>
            <View style={styles.background_view}>
                {renderSetupProp()}
             </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ...theme, 
    infoView: {
        ...theme.background_view,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "auto"
      },
      imageUploadButton: {
        height: 45,
        minWidth: 100,
        marginTop: 20,
        marginHorizontal: 10
      },
      imageUploadButtonText: {
        fontSize: 20
      },
      doneButton: {
        height: 50,
        position: "absolute",
        bottom: 20
      },
      titleText: {
        ...theme.header,
        marginBottom: 10,
        textAlign: "center"
      },
      profileImage: {
        height: 200,
        width: 200,
        borderRadius: 15,
        alignSelf: "center"

      },
      titleView: {
        position: "absolute",
        top: 20
      },
      inlineImageButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
      }
})

export default InitialAccountFlow;