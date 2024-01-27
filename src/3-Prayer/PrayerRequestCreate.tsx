import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, PRAYER_REQUEST_DISPLAY_ROUTE_NAME, StackNavigationProps, PrayerRequestViewMode, FormSubmit, CallbackParam } from '../TypesAndInterfaces/custom-types';
import { FormInput, PrayerRequestTouchable, Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import InputField from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { CREATE_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';

const PrayerRequestForm = ({callback}:CallbackParam):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onPrayerRequestCreate = (formValues:Record<string, string>) => {
        axios.post(`${DOMAIN}/api/prayer-request`, formValues, RequestAccountHeader).then((response) => {
            // TODO: save something to axios?


            callback();
        })
    }

    return (
        <View style={styles.center}>
            <View style={styles.background_view}>
                <Text style={styles.header}>Create Prayer Request</Text>
                <FormInput 
                    fields={CREATE_PRAYER_REQUEST_FIELDS}
                    ref={formInputRef}
                    onSubmit={onPrayerRequestCreate}
                />
                <Raised_Button buttonStyle={styles.sign_in_button}
                    text='Create Prayer Request'
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