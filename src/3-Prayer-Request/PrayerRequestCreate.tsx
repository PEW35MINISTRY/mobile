import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, SafeAreaView, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { addOwnedPrayerRequest, RootState } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPostRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS } from '../theme';
import InputField, { InputType } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { CREATE_PRAYER_REQUEST_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { Outline_Button, Raised_Button, XButton } from '../widgets';
import { RecipientForm } from '../Widgets/RecipientIDList/RecipientForm';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import Toast from 'react-native-toast-message';

const PrayerRequestCreateForm = (props:{callback:((listItem?:PrayerRequestListItem) => void)}):JSX.Element => {
    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const [addUserRecipientIDList, setAddUserRecipientIDList] = useState<number[]>([]);
    const [addCircleRecipientIDList, setAddCircleRecipientIDList] = useState<number[]>([]);
    const [recipientFormModalVisible, setRecipientFormModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onPrayerRequestCreate = (formValues:Record<string, string | string[]>) => {
        //@ts-ignore - can't directly TS cast or copy over values
        const prayerRequest:PrayerRequestPostRequestBody = {...formValues}

        prayerRequest.addCircleRecipientIDList = addCircleRecipientIDList;
        prayerRequest.addUserRecipientIDList = addUserRecipientIDList;
        
        axios.post(`${DOMAIN}/api/prayer-request`, prayerRequest, RequestAccountHeader).then((response) => {    
            const newPrayerRequest:PrayerRequestResponseBody = response.data;
            const newPrayerRequestListItem:PrayerRequestListItem = {
                prayerRequestID: newPrayerRequest.prayerRequestID,
                requestorProfile: {
                    userID: userProfile.userID,
                    firstName: userProfile.firstName,
                    displayName: userProfile.displayName,
                    image: userProfile.image,
                },
                topic: prayerRequest.topic,
                prayerCount: 0,
                tagList: newPrayerRequest.tagList
            }
            dispatch(addOwnedPrayerRequest(newPrayerRequestListItem));
            props.callback();
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
        
    }

    return (
            <SafeAreaView style={styles.center}>
                <View style={styles.background_view}>
                    <View style={styles.headerThing}>
                        <Text allowFontScaling={false} style={styles.headerText}>Create Prayer Request</Text>
                    </View>
                    <FormInput 
                        fields={CREATE_PRAYER_REQUEST_FIELDS.filter((field:InputField) => field.type !== InputType.CIRCLE_ID_LIST && field.type !== InputType.USER_ID_LIST)}
                        ref={formInputRef}
                        onSubmit={onPrayerRequestCreate}
                    />
                    <Outline_Button 
                        text="Select Recipients"
                        onPress={() => setRecipientFormModalVisible(true)}
                    />
                    {
                        (addCircleRecipientIDList.length !== 0 || addUserRecipientIDList.length !== 0) &&                 
                            <Raised_Button buttonStyle={styles.sign_in_button}
                                text='Create Prayer Request'
                                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
                            />
                    }

                    <Modal 
                        visible={recipientFormModalVisible}
                        onRequestClose={() => setRecipientFormModalVisible(false)}
                        animationType='slide'
                        transparent={true}
                    > 
                        <RecipientForm
                            addCircleRecipientIDList={addCircleRecipientIDList}
                            addUserRecipientIDList={addUserRecipientIDList}
                            setAddCircleRecipientIDList={setAddCircleRecipientIDList}
                            setAddUserRecipientIDList={setAddUserRecipientIDList}

                            callback={() => setRecipientFormModalVisible(false)}
                        />
                    </Modal>
                </View>
                <XButton callback={props.callback} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
                <Toast />
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

export default PrayerRequestCreateForm;