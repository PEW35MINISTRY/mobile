import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { removeExpiringPrayerRequest, RootState, setOwnedPrayerRequests } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPatchRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS } from '../theme';
import { EDIT_PRAYER_REQUEST_FIELDS, getDateDaysFuture } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import PrayerRequestList from './PrayerRequestList';
import InputField, { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { Confirmation, DeleteButton, Filler, Outline_Button, Raised_Button, XButton } from '../widgets';
import { RecipientForm } from '../Widgets/RecipientIDList/RecipientForm';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import Toast from 'react-native-toast-message';

const PrayerRequestEditForm = (props:{prayerRequestResponseData:PrayerRequestResponseBody, prayerRequestListData:PrayerRequestListItem, callback:((prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem, deletePrayerRequest?:boolean) => void)}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const dispatch = useAppDispatch();

    const [addUserRecipientIDList, setAddUserRecipientIDList] = useState<number[]>([]);
    const [removeUserRecipientIDList, setRemoveAddUserRecipientIDList] = useState<number[]>([]);
    const [addCircleRecipientIDList, setAddCircleRecipientIDList] = useState<number[]>([]);
    const [removeCircleRecipientIDList, setRemoveCircleRecipientIDList] = useState<number[]>([]);
    const [recipientFormModalVisible, setRecipientFormModalVisible] = useState(false);
    const [deletePrayerRequestModalVisible, setDeletePrayerRequestModalVisible] = useState(false);
    const [showToastRef, setShowToastRef] = useState(false);

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


    const onPrayerRequestEdit = (formValues:Record<string, string | string[]>) => {
        var fieldsChanged = false;
        const editedFields:PrayerRequestPatchRequestBody = {
            topic: props.prayerRequestResponseData.topic,
            description: props.prayerRequestResponseData.description,
            expirationDate: props.prayerRequestResponseData.expirationDate,
        };

        // Copy over the other fields that changed
        for (const [key, value] of Object.entries(formValues)) {
            //@ts-ignore
            if (value !== editedFields[key]) { editedFields[key] = value; fieldsChanged = true; }
        }

        // Copy over recipient fields manually for each field
        if (addCircleRecipientIDList.length > 0) {
            editedFields.addCircleRecipientIDList = addCircleRecipientIDList; fieldsChanged = true;
        }
        if (addUserRecipientIDList.length > 0) {
            editedFields.addUserRecipientIDList = addUserRecipientIDList; fieldsChanged = true;
        }
        if (removeCircleRecipientIDList.length > 0) {
            editedFields.removeCircleRecipientIDList = removeCircleRecipientIDList; fieldsChanged = true;
        }
        if (removeUserRecipientIDList.length > 0) {
            editedFields.removeUserRecipientIDList = removeUserRecipientIDList; fieldsChanged = true;
        }

        if (fieldsChanged) {
            axios.patch(`${DOMAIN}/api/prayer-request-edit/` + props.prayerRequestResponseData.prayerRequestID, editedFields, RequestAccountHeader).then((response) => {
                const newPrayerRequest:PrayerRequestResponseBody = {...response.data};

                const newPrayerRequestListItem:PrayerRequestListItem = {...props.prayerRequestListData};

                newPrayerRequestListItem.topic = newPrayerRequest.topic;
                newPrayerRequestListItem.tagList = newPrayerRequest.tagList;
                

                ToastQueueManager.show({message: "Prayer Request saved"})

                // remove from expiring list if Long Term is set and the prayer request was about to expire
                if (editedFields.expirationDate !== undefined && newPrayerRequest.isOnGoing && new Date(editedFields.expirationDate) > new Date()) dispatch(removeExpiringPrayerRequest(newPrayerRequest.prayerRequestID))

                props.callback(newPrayerRequest, newPrayerRequestListItem);
            }).catch((error:AxiosError<ServerErrorResponse>) => { setShowToastRef(true); ToastQueueManager.show({error, callback: setShowToastRef})});
        }
        else {
            props.callback();
        }
    }

    return (
            <SafeAreaView style={styles.center}>
                <View style={styles.background_view}>
                    <Text allowFontScaling={false} style={styles.header}>Edit Prayer Request</Text>
                    <FormInput 
                        fields={EDIT_PRAYER_REQUEST_FIELDS.filter((field:InputField) => field.type !== InputType.CIRCLE_ID_LIST && field.type !== InputType.USER_ID_LIST && field.field !== 'duration')}
                        ref={formInputRef}
                        defaultValues={props.prayerRequestResponseData}
                        onSubmit={onPrayerRequestEdit}
                    />
                    <Outline_Button 
                        text="Select Recipients"
                        onPress={() => setRecipientFormModalVisible(true)}
                    />

                    <Raised_Button buttonStyle={styles.sign_in_button}
                        text='Save Changes'
                        onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
                    />
                    <Modal 
                        visible={deletePrayerRequestModalVisible}
                        onRequestClose={() => setDeletePrayerRequestModalVisible(false)}
                        animationType='slide'
                        transparent={true}
                    >
                        <Confirmation 
                            callback={onPrayerRequestDelete}
                            onCancel={() => setDeletePrayerRequestModalVisible(false)}
                            promptText={'delete this Prayer Request?'}
                            buttonText='Delete'
                        />
                    </Modal>
                    <Modal
                        visible={recipientFormModalVisible}
                        onRequestClose={() => setRecipientFormModalVisible(false)}
                        animationType='slide'
                        transparent={true}
                    >
                        <RecipientForm 
                            addCircleRecipientIDList={addCircleRecipientIDList}
                            addUserRecipientIDList={addUserRecipientIDList}
                            removeCircleRecipientIDList={removeCircleRecipientIDList}
                            removeUserRecipientIDList={removeUserRecipientIDList}

                            setAddCircleRecipientIDList={setAddCircleRecipientIDList}
                            setAddUserRecipientIDList={setAddUserRecipientIDList}
                            setRemoveCircleRecipientIDList={setRemoveCircleRecipientIDList}
                            setRemoveUserRecipientIDList={setRemoveAddUserRecipientIDList}

                            circleRecipientList={props.prayerRequestResponseData.circleRecipientList}
                            userRecipientList={props.prayerRequestResponseData.userRecipientList}
                            callback={() => setRecipientFormModalVisible(false)}
                        />
                    </Modal>
                </View>
                <DeleteButton callback={() => setDeletePrayerRequestModalVisible(true)} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
                <XButton callback={props.callback} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined} />

                {showToastRef && <Toast />}
            </SafeAreaView>  
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