import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { addOwnedPrayerRequest, RootState } from '../redux-store';
import { PrayerRequestListItem, PrayerRequestPostRequestBody, PrayerRequestResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import theme, { COLORS } from '../theme';
import { RecipientForm } from '../Widgets/RecipientIDList/RecipientForm';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import Toast from 'react-native-toast-message';
import { getDateDaysFuture } from '../TypesAndInterfaces/config-sync/input-config-sync/circle-field-config';
import ComponentFlow from '../Widgets/ComponentFlow/ComponentFlow';
import { CALLBACK_STATE, PrayerRequestCreateContext } from '../TypesAndInterfaces/custom-types';
import PrayerRequestCreateData from './PrayerRequestCreateData';

const PrayerRequestCreateForm = (props:{callback:((listItem?:PrayerRequestListItem) => void)}):JSX.Element => {
    const dispatch = useAppDispatch();
    
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const [showToastRef, setShowToastRef] = useState(true);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onComplete = (context:PrayerRequestCreateContext, finalState?:CALLBACK_STATE) => {
        if (finalState === CALLBACK_STATE.EXIT) props.callback()
        else {
            setShowToastRef(false)
            onSuccess(context);
        }
    }

    const onSuccess = (context:PrayerRequestCreateContext) => {

        const prayerRequest:PrayerRequestPostRequestBody = {...context.prayerRequestFields}

        prayerRequest.addCircleRecipientIDList = context.addCircleRecipientIDList;
        prayerRequest.addUserRecipientIDList = context.addUserRecipientIDList;
        
        axios.post(`${DOMAIN}/api/prayer-request`, prayerRequest, RequestAccountHeader).then((response) => {    
            const newPrayerRequest:PrayerRequestResponseBody = response.data;
            const newPrayerRequestListItem:PrayerRequestListItem = {
                prayerRequestID: newPrayerRequest.prayerRequestID,
                requestorID: newPrayerRequest.requestorID,
                requestorProfile: {
                    userID: userProfile.userID,
                    firstName: userProfile.firstName,
                    displayName: userProfile.displayName,
                    image: userProfile.image,
                },
                topic: prayerRequest.topic,
                description: prayerRequest.description,
                tagList: newPrayerRequest.tagList ?? [],
                prayerCount: newPrayerRequest.prayerCount,
                prayerCountRecipient: 0,
                createdDT: newPrayerRequest.createdDT,
                modifiedDT: newPrayerRequest.modifiedDT                
            }
            dispatch(addOwnedPrayerRequest(newPrayerRequestListItem));
            ToastQueueManager.show({message: "Sucessfully created Prayer Request"}); 
            props.callback();
        }).catch((error:AxiosError<ServerErrorResponse>) => { setShowToastRef(true); ToastQueueManager.show({error})});
    }

    return (
        <React.Fragment>
            <ComponentFlow 
                components={[
                    //@ts-ignore
                    <PrayerRequestCreateData continueNavigation={true}/>,
                    //@ts-ignore
                    <RecipientForm continueNavigation={false} />
                ]}
                onComplete={onComplete}
                context={{
                    addUserRecipientIDList: [],
                    addCircleRecipientIDList: [],
                }}
                backAction={true}
            />
        {showToastRef && <Toast />}    
        </React.Fragment>
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