import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Modal, SafeAreaView } from "react-native";
import { CALLBACK_STATE, StackNavigationProps } from "../../TypesAndInterfaces/custom-types";
import { COLORS } from "../../theme";
import { ProcessingFiller } from "../../widgets";

const ComponentFlow = (props:{components:JSX.Element[], onComplete: (args?:any, finalState?:CALLBACK_STATE) => void, context?:any, backAction?:boolean}):JSX.Element => {

    const [componentIndex, setComponentIndex] = useState<number>(0);
    const [context, setContext] = useState<any>(props.context || {});
    const [components, setComponents] = useState<JSX.Element[]>([]);
    const [latestState, setLatestState] = useState<CALLBACK_STATE>(CALLBACK_STATE.SUCCESS)

    const onCallbackTrigger = (newState:CALLBACK_STATE) => {
      setLatestState(newState);

      let change = 0;
      switch(newState) {
        case CALLBACK_STATE.EXIT: 
          break;
        case CALLBACK_STATE.SUCCESS:
          change = 1;
          break;
        case CALLBACK_STATE.FAILURE:
        case CALLBACK_STATE.BACK:
          change = -1;
      }

      setComponentIndex((val) => (change <= 0 && val === 0) ? val : val+change);
    }

    useEffect(() => {
      // use state variable to check for exit to avoid stale reference to componentIndex. See https://medium.com/@anandsimmy7/stale-closures-and-react-hooks-ea60689a3544
      if (latestState === CALLBACK_STATE.EXIT && props.backAction) {
        props.onComplete(context, latestState);
      }
    }, [latestState])

    useEffect(() => {
      if (components.length && componentIndex >= components.length) props.onComplete(context)
    }, [componentIndex])

    useEffect(() => {
      if (latestState === CALLBACK_STATE.DELETE) {
        props.onComplete(context, latestState)
        setLatestState(CALLBACK_STATE.NONE)
      }
    }, [latestState])

    useEffect(() => {
      setComponents(props.components.map((element, index) => 
        React.cloneElement(element, { callback: (state:CALLBACK_STATE) => onCallbackTrigger(state), continueNavigation: index !== props.components.length-1, context: context, setContext: setContext} )
      ))
    }, [context])

    return (
        <SafeAreaView style={styles.backgroundView}>
            <View style={styles.backgroundView}>
                {componentIndex < components.length ? components[componentIndex] : <ProcessingFiller callback={() => onCallbackTrigger(CALLBACK_STATE.BACK)}/>}
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