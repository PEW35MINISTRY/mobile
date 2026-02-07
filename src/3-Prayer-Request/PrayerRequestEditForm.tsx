import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { removeExpiringPrayerRequest, RootState, setOwnedPrayerRequests } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPatchRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS } from '../theme';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { RecipientForm } from '../Widgets/RecipientIDList/RecipientForm';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import Toast from 'react-native-toast-message';
import ComponentFlow from '../Widgets/ComponentFlow/ComponentFlow';
import PrayerRequestEditData from './PrayerRequestEditData';
import { CALLBACK_STATE, PrayerRequestEditContext } from '../TypesAndInterfaces/custom-types';

const PrayerRequestEditForm = (props:{prayerRequestResponseData:PrayerRequestResponseBody, prayerRequestListData:PrayerRequestListItem, callback:((prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem, deletePrayerRequest?:boolean) => void)}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const [showToastRef, setShowToastRef] = useState(true);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onPrayerRequestDelete = () =>
        axios.delete(`${DOMAIN}/api/prayer-request-edit/` + props.prayerRequestListData.prayerRequestID, RequestAccountHeader)
            .then((response) => {
                props.callback(undefined, undefined, true);
                ToastQueueManager.show({message: "Prayer request deleted"})
            }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));

    const onSuccess = (context:PrayerRequestEditContext) => {

        var fieldsChanged = false;
        const editedFields:PrayerRequestPatchRequestBody = {
            topic: props.prayerRequestResponseData.topic,
            description: props.prayerRequestResponseData.description,
            expirationDate: props.prayerRequestResponseData.expirationDate,
        };

        // Copy over recipient fields manually for each field
        if (context.addCircleRecipientIDList.length > 0) {
            editedFields.addCircleRecipientIDList = context.addCircleRecipientIDList; fieldsChanged = true;
        }
        if (context.addUserRecipientIDList.length > 0) {
            editedFields.addUserRecipientIDList = context.addUserRecipientIDList; fieldsChanged = true;
        }
        if (context.removeCircleRecipientIDList.length > 0) {
            editedFields.removeCircleRecipientIDList = context.removeCircleRecipientIDList; fieldsChanged = true;
        }
        if (context.removeUserRecipientIDList.length > 0) {
            editedFields.removeUserRecipientIDList = context.removeUserRecipientIDList; fieldsChanged = true;
        }

        // Copy over the other fields that changed
        for (const [key, value] of Object.entries(context.prayerRequestFields)) {
            //@ts-ignore - arrays are considered objects in JS, which cannot be compared directly. Thus, we need to stringify for comparison
            const dirtyField = Array.isArray(value) ? value.toString() !== props.prayerRequestResponseData[key].toString() : value !== props.prayerRequestResponseData[key];

            if (dirtyField) { 
                //@ts-ignore
                editedFields[key] = value; fieldsChanged = true;
            }
        }

        if (fieldsChanged) {
            axios.patch(`${DOMAIN}/api/prayer-request-edit/` + props.prayerRequestResponseData.prayerRequestID, editedFields, RequestAccountHeader).then((response) => {
                const newPrayerRequest:PrayerRequestResponseBody = {...response.data};

                const newPrayerRequestListItem:PrayerRequestListItem = {...props.prayerRequestListData};


                newPrayerRequestListItem.topic = newPrayerRequest.topic;
                newPrayerRequestListItem.description = newPrayerRequest.description;
                newPrayerRequestListItem.tagList = newPrayerRequest.tagList ?? [];

                newPrayerRequestListItem.modifiedDT = new Date().toISOString(); //temp fix

                ToastQueueManager.show({message: "Prayer Request saved"})

                props.callback(newPrayerRequest, newPrayerRequestListItem);
            }).catch((error:AxiosError<ServerErrorResponse>) => { setShowToastRef(true); ToastQueueManager.show({error})});
        } else { props.callback()}
    }

    const onComplete = (context:PrayerRequestEditContext, finalState?:CALLBACK_STATE) => {
    
        if (finalState === CALLBACK_STATE.EXIT) props.callback();
        else if (finalState === CALLBACK_STATE.DELETE) onPrayerRequestDelete();
        else {
            setShowToastRef(false)
            onSuccess(context); 
        } 
    }

    return (
        <React.Fragment>
            <ComponentFlow 
                components={[
                    //@ts-ignore
                    <PrayerRequestEditData listData={props.prayerRequestListData} continueNavigation={true}/>,
                    //@ts-ignore
                    <RecipientForm continueNavigation={false} />
                ]}
                onComplete={onComplete}
                context={{
                    userRecipientList: props.prayerRequestResponseData.userRecipientList,
                    circleRecipientList: props.prayerRequestResponseData.circleRecipientList,
                    addUserRecipientIDList: [],
                    addCircleRecipientIDList: [],
                    removeUserRecipientIDList: [],
                    removeCircleRecipientIDList: [],
                    prayerRequestFields: props.prayerRequestResponseData
                }}
                backAction={true}
            />
        {showToastRef && <Toast />}
        </React.Fragment>
       
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
    fillerStyle: {
        height: 90,
    },
    deleteView: {
        backgroundColor: COLORS.black,
        height: '50%',
        marginTop: 'auto',
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
    }
})

export default PrayerRequestEditForm;