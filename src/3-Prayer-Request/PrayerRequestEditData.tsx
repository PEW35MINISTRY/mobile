import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView, Platform } from 'react-native';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { EDIT_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import InputField, { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { Confirmation, DeleteButton, Raised_Button, XButton } from '../widgets';
import Toast from 'react-native-toast-message';
import { CALLBACK_STATE, PrayerRequestEditContext } from '../TypesAndInterfaces/custom-types';
import { getEnvironment } from '../utilities/utilities';
import { InputTypesAllowed } from '../TypesAndInterfaces/config-sync/input-config-sync/inputValidation';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS } from '../theme';

const PrayerRequestEditData = (props:{callback: (state:CALLBACK_STATE) => void, continueNavigation:boolean, context:PrayerRequestEditContext, setContext:React.Dispatch<PrayerRequestEditContext>, listData:PrayerRequestListItem}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);

    const [showToastRef, setShowToastRef] = useState(false);
    const [deletePrayerRequestModalVisible, setDeletePrayerRequestModalVisible] = useState(false);
    
    const onPrayerRequestEdit = (formValues:Record<string, InputTypesAllowed>) => {

        //@ts-ignore
        props.setContext((oldState:PrayerRequestEditContext) => ({ ...oldState, prayerRequestFields: formValues}))

        props.callback(CALLBACK_STATE.SUCCESS)
    }

    useEffect(() => {

    }, [props.context])

    return (
        <SafeAreaView style={styles.center}>
            <View style={styles.background_view}>
                <FormInput 
                    fields={EDIT_PRAYER_REQUEST_FIELDS.filter((field:InputField) => field.type !== InputType.CIRCLE_ID_LIST && field.type !== InputType.USER_ID_LIST && field.field !== 'duration' && field.environmentList.includes(getEnvironment()))}
                    ref={formInputRef}
                    modelIDFieldDetails={({ modelIDField: 'prayerRequestID', modelID: props.listData.prayerRequestID })}
                    defaultValues={props.context.prayerRequestFields}
                    onSubmit={onPrayerRequestEdit}
                />    
                <Raised_Button buttonStyle={styles.sign_in_button}
                    text='Next'
                    onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
                />
                <Modal 
                    visible={deletePrayerRequestModalVisible}
                    onRequestClose={() => setDeletePrayerRequestModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <Confirmation 
                        callback={() => props.callback(CALLBACK_STATE.DELETE)}
                        onCancel={() => setDeletePrayerRequestModalVisible(false)}
                        promptText={'delete this Prayer Request?'}
                        buttonText='Delete'
                    />
                </Modal>
            </View>
            <DeleteButton callback={() => setDeletePrayerRequestModalVisible(true)} />
            <XButton callback={() => props.callback(CALLBACK_STATE.EXIT)} />
        </SafeAreaView>  
    )
              
}

const styles = StyleSheet.create({
    ...theme,
    backgroundView: {
        backgroundColor: COLORS.black,
        flex: 1
    },
    header: {
        ...theme.header,
        top: -20
    },
    sign_in_button: {
        marginVertical: 15,
    },
    fillerStyle: {
        height: 90,
    },
    deleteView: {
        backgroundColor: COLORS.black,
        height: '50%',
        //marginTop: 'auto',
        justifyContent: "center"
    },
    confirmDeleteText: {
        ...theme.title,
        alignSelf: "center",
        textAlign: "center",
        maxWidth: '90%'
    },
    buttons: {
        maxWidth: '70%',
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    fillerHeight: {
        top: 25
    }
})

export default PrayerRequestEditData