import { View, StyleSheet, Modal, Text } from 'react-native';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { PrayerRequestComment } from './prayer-request-widgets';
import React, { useRef } from 'react';
import ProfileImageSettings from '../1-Profile/ProfileImageSettings';
import { Raised_Button } from '../widgets';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { PRAYER_REQUEST_COMMENT_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/prayer-request-field-config';
import theme, { COLORS } from '../theme';
import { PrayerRequestCommentListItem, PrayerRequestCommentRequestBody, PrayerRequestListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/prayer-request-types';
import { DOMAIN } from '@env';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../redux-store';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/toast-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

export const PrayerRequestCommentCreate = (props:{prayerRequestItem:PrayerRequestListItem, callback:((prayerRequestComment:PrayerRequestCommentListItem) => void)}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
    }

    const onCommentCreate = (formValues:Record<string, string | string[]>) => {
        
        const postComment:PrayerRequestCommentRequestBody = {
            message: formValues.message.toString()
        }

        axios.post(`${DOMAIN}/api/prayer-request/`+ props.prayerRequestItem.prayerRequestID + `/comment`, postComment, RequestAccountHeader).then((response:AxiosResponse) => {
            const prayerRequestResponse:PrayerRequestCommentListItem = response.data;
            
            const prayerRequestCommentItem:PrayerRequestCommentListItem = {
                commentID: prayerRequestResponse.commentID,
                prayerRequestID: props.prayerRequestItem.prayerRequestID,
                commenterProfile: {
                    userID: userProfile.userID,
                    firstName: userProfile.firstName,
                    displayName: userProfile.displayName,
                    image: userProfile.image
                },
                message: postComment.message,
                likeCount: 0
            }
            props.callback(prayerRequestCommentItem);

        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show(error));
    }

    return (
        <View style={styles.center}>
        <View style={theme.background_view}>
            <Text style={styles.header}>Create Comment</Text>
              <FormInput 
                fields={PRAYER_REQUEST_COMMENT_FIELDS}
                onSubmit={onCommentCreate}
                ref={formInputRef}
              />
              <Raised_Button buttonStyle={styles.sign_in_button}
                text='Post Comment'
                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
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
    logo: {
      height: 175,
      marginBottom: 10,
    },
    pew35_logo: {
      height: 75,
      width: 75,
      bottom: 0,
    },
    social_icon: {
      width: 35,
      height: 35,
      marginHorizontal: 15,
    },
    hands_image: {
      position: 'absolute',
      bottom: 0,
      zIndex: -1,
      opacity: 0.6
    },
    sign_in_button: {
      marginVertical: 15,
    },
    dropdownText: {
      color: COLORS.white,
    },
    dropdownSelected: {
      color: COLORS.white,
    },
    dropdown: {
      width: 300,
      marginLeft: 3,
      paddingVertical: 5,
      paddingHorizontal: 15,
    }
  
  });