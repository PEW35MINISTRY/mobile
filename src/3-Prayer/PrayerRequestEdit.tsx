import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, updatePrayerRequest } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPatchRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { PRAYER_REQUEST_NAVIGATOR_ROUTE_NAME, PRAYER_REQUEST_DISPLAY_ROUTE_NAME, StackNavigationProps, PrayerRequestListViewMode, FormSubmit, CallbackParam, FormDataType } from '../TypesAndInterfaces/custom-types';
import { FormInput, PrayerRequestTouchable, Raised_Button } from '../widgets';
import theme, { COLORS } from '../theme';
import { EDIT_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import PrayerRequestList from './PrayerRequestList';
import InputField, { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';

const PrayerRequestEditForm = (props:{prayerRequestResponseData:PrayerRequestResponseBody, prayerRequestListData:PrayerRequestListItem, callback:((prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem) => void)}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const dispatch = useAppDispatch();

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onPrayerRequestEdit = (formValues:Record<string, string | string[]>) => {
        var fieldsChanged = false;
        const editedFields:PrayerRequestPatchRequestBody = {
            topic: props.prayerRequestResponseData.topic,
            description: props.prayerRequestResponseData.description,
            expirationDate: props.prayerRequestResponseData.expirationDate
        };

        // Copy over the other fields that changed
        for (const [key, value] of Object.entries(formValues)) {
            //@ts-ignore
            if (value !== editedFields[key]) { editedFields[key] = value; fieldsChanged = true; }
        }

        if (fieldsChanged) {
            axios.patch(`${DOMAIN}/api/prayer-request-edit/` + props.prayerRequestResponseData.prayerRequestID, editedFields, RequestAccountHeader).then((response) => {
                
                const newPrayerRequest:PrayerRequestResponseBody = {...response.data};

                const newPrayerRequestListItem:PrayerRequestListItem = {...props.prayerRequestListData};
                newPrayerRequestListItem.topic = newPrayerRequest.topic;
                newPrayerRequestListItem.tagList = newPrayerRequest.tagList

                dispatch(updatePrayerRequest(newPrayerRequestListItem));

                props.callback(newPrayerRequest, newPrayerRequestListItem);
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
                    fields={EDIT_PRAYER_REQUEST_FIELDS.filter((field:InputField) => field.type !== InputType.CIRCLE_ID_LIST && field.type !== InputType.USER_ID_LIST)}
                    ref={formInputRef}
                    defaultValues={props.prayerRequestResponseData}
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

export default PrayerRequestEditForm;