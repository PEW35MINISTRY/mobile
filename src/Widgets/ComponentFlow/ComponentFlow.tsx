import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Modal, SafeAreaView } from "react-native";
import { CALLBACK_STATE, StackNavigationProps } from "../../TypesAndInterfaces/custom-types";
import { COLORS } from "../../theme";

const ComponentFlow = (props:{components:JSX.Element[], onCompleteArgs?:any, onComplete: (args:any) => void}):JSX.Element => {

    const [componentIndex, setComponentIndex] = useState<number>(0);
    const [context, setContext] = useState<any>({});
    const [components, setComponents] = useState<JSX.Element[]>([]);

    useEffect(() => {
      if (components.length && componentIndex >= components.length) props.onComplete(props.onCompleteArgs)
    }, [componentIndex])

    useEffect(() => {
      setComponents(props.components.map((element, index) => 
        React.cloneElement(element, { callback: (state:CALLBACK_STATE) => onCallbackTrigger(state), continueNavigation: index !== props.components.length-1, context: context, setContext: setContext } )
      ))
    }, [])

    const onCallbackTrigger = (newState:CALLBACK_STATE) => {
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

    return (
        <SafeAreaView style={styles.backgroundView}>
            <View style={styles.backgroundView}>
                <Modal 
                    visible={componentIndex < components.length}
                    onRequestClose={() => setComponentIndex((val) => val+1)}
                    animationType='slide'
                    transparent={true}
                >
                    {componentIndex < components.length && components[componentIndex]}
                </Modal>
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

export default ComponentFlow