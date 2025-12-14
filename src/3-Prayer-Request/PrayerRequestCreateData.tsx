import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Platform } from 'react-native';
import { CALLBACK_STATE, PrayerRequestCreateContext } from '../TypesAndInterfaces/custom-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { CREATE_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import InputField, { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { InputTypesAllowed } from '../TypesAndInterfaces/config-sync/input-config-sync/inputValidation';
import { Raised_Button, XButton } from '../widgets';
import theme from '../theme';

const PrayerRequestCreateData = (props:{callback: (state:CALLBACK_STATE) => void, continueNavigation:boolean, context:PrayerRequestCreateContext, setContext:React.Dispatch<PrayerRequestCreateContext>, }):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);

    const onPrayerRequestCreate = (formValues:Record<string, InputTypesAllowed>) => {
        //@ts-ignore
        props.setContext( (oldState:PrayerRequestCreateContext) => ({...oldState, prayerRequestFields: formValues }))
        props.callback(CALLBACK_STATE.SUCCESS)
    }

     return (
            <SafeAreaView style={styles.center}>
                <View style={styles.background_view}>
                    <View style={styles.headerThing}>
                        <Text allowFontScaling={false} style={styles.headerText}>Create Prayer Request</Text>
                    </View>
                    <FormInput 
                        fields={CREATE_PRAYER_REQUEST_FIELDS.filter((field:InputField) => field.type !== InputType.CIRCLE_ID_LIST && field.type !== InputType.USER_ID_LIST && !field.hide)}
                        ref={formInputRef}
                        defaultValues={props.context.prayerRequestFields ?? undefined}
                        onSubmit={onPrayerRequestCreate}
                    />
                    <Raised_Button buttonStyle={styles.sign_in_button}
                        text={props.continueNavigation ? "Next" : "Done"}
                        onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
                    />
                </View>
                <XButton callback={() => props.callback(CALLBACK_STATE.EXIT)} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
            </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ...theme,
    headerText: {
        ...theme.header,
        marginVertical: 20,
        textAlign: "center"
    },
    headerThing: {
        maxWidth: '80%'
    },
    sign_in_button: {
        marginVertical: 15,
    },

})

export default PrayerRequestCreateData;