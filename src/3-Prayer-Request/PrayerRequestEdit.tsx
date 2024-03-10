import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState, removePrayerRequest, updatePrayerRequest } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPatchRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS } from '../theme';
import { EDIT_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import PrayerRequestList from './PrayerRequestList';
import InputField, { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { Outline_Button, Raised_Button } from '../widgets';
import { RecipientForm } from '../Widgets/RecipientIDList/RecipientForm';

const PrayerRequestEditForm = (props:{prayerRequestResponseData:PrayerRequestResponseBody, prayerRequestListData:PrayerRequestListItem, callback:((prayerRequestData?:PrayerRequestResponseBody, prayerRequestListData?:PrayerRequestListItem, deletePrayerRequest?:boolean) => void)}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const dispatch = useAppDispatch();

    const [addUserRecipientIDList, setAddUserRecipientIDList] = useState<number[]>([]);
    const [removeUserRecipientIDList, setRemoveAddUserRecipientIDList] = useState<number[]>([]);
    const [addCircleRecipientIDList, setAddCircleRecipientIDList] = useState<number[]>([]);
    const [removeCircleRecipientIDList, setRemoveCircleRecipientIDList] = useState<number[]>([]);
    const [recipientFormModalVisible, setRecipientFormModalVisible] = useState(false);
    const [deletePrayerRequestModalVisible, setDeletePrayerRequestModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const handlePrayerRequestDelete = () => {
        dispatch(removePrayerRequest(props.prayerRequestListData.prayerRequestID));

        axios.delete(`${DOMAIN}/api/prayer-request-edit/` + props.prayerRequestListData.prayerRequestID, RequestAccountHeader).then((response) => {
            props.callback(undefined, undefined, true);
        }).catch((error:AxiosError) => console.log(error))
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
                newPrayerRequestListItem.tagList = newPrayerRequest.tagList

                dispatch(updatePrayerRequest(newPrayerRequestListItem));

                props.callback(newPrayerRequest, newPrayerRequestListItem);
            }).catch((error:AxiosError) => console.log(error))
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
                <Outline_Button 
                    text="Delete Prayer Request"
                    onPress={() => setDeletePrayerRequestModalVisible(true)}
                    buttonStyle={{borderColor: COLORS.primary}}
                />
                <Outline_Button 
                    text="Recipient Settings"
                    onPress={() => setRecipientFormModalVisible(true)}
                />

                <Raised_Button buttonStyle={styles.sign_in_button}
                    text='Save Changes'
                    onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
                />
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
                <Modal
                    visible={deletePrayerRequestModalVisible}
                    onRequestClose={() => setDeletePrayerRequestModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <View style={styles.deleteView}>
                        <Text style={styles.confirmDeleteText}>Are you sure you want to delete this prayer request?</Text>
                        <View style={styles.buttons}>
                            <Raised_Button buttonStyle={styles.sign_in_button}
                                text='Delete'
                                onPress={handlePrayerRequestDelete}
                            />
                            <Outline_Button 
                                text="Cancel"
                                onPress={() => setDeletePrayerRequestModalVisible(false)}
                            />
                        </View>
                    </View>
                </Modal>
                
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