import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPatchRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, PRAYER_REQUEST_DISPLAY_ROUTE_NAME, StackNavigationProps, PrayerRequestViewMode, FormSubmit, CallbackParam } from '../TypesAndInterfaces/custom-types';
import { FormInput, PrayerRequestTouchable, Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import { EDIT_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';

const PrayerRequestForm = (props:{prayerRequestProp:PrayerRequestResponseBody, callback:(() => void)}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onPrayerRequestEdit = (formValues:Record<string, string>) => {
        var fieldsChanged = false;
        const editedFields = {
            topic: props.prayerRequestProp.topic,
            description: props.prayerRequestProp.description,
            expirationDate: props.prayerRequestProp.expirationDate
        } as PrayerRequestPatchRequestBody;

        for (const [key, value] of Object.entries(formValues)) {
            //@ts-ignore
            if (value !== props.prayerRequestProp[key]) { editedFields[key] = value; fieldsChanged = true; }
        }

        if (fieldsChanged) {
            axios.patch(`${DOMAIN}/api/prayer-request-edit/` + props.prayerRequestProp.prayerRequestID, editedFields, RequestAccountHeader).then((response) => {
                // TODO: determine if redux state needs to change
                

                props.callback();
            })
        }
        else {
            props.callback();
        }

    }

    return (
        <View style={styles.center}>
            <View style={styles.background_view}>
                <Text style={styles.header}>Edit Prayer Request</Text>
                <FormInput 
                    fields={EDIT_PRAYER_REQUEST_FIELDS}
                    ref={formInputRef}
                    defaultValues={props.prayerRequestProp}
                    onSubmit={onPrayerRequestEdit}
                />
                <Raised_Button buttonStyle={styles.sign_in_button}
                    text='Save Changes'
                    onPress={() => formInputRef.current == null ? console.log("null") : formInputRef.current.onHandleSubmit()}
                />
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    ...theme,
    header: {
        ...theme.header,
        marginVertical: 20,
    },
    sign_in_button: {
        marginVertical: 15,
    },

})

export default PrayerRequestForm;