import { DOMAIN, ENVIRONMENT } from '@env';
import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { EMAIL_VERIFY_PROFILE_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { useAppDispatch } from '../TypesAndInterfaces/hooks';
import { registerNotificationDevice, setAccount } from '../redux-store';
import theme, { COLORS } from '../theme';
import { Raised_Button, BackButton } from '../widgets';
import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { LoginResponseBody } from '../TypesAndInterfaces/config-sync/api-type-sync/auth-types';
import InputField from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { getEnvironment } from '../utilities/utilities';
import { InputTypesAllowed } from '../TypesAndInterfaces/config-sync/input-config-sync/inputValidation';
import { LoginProps } from '../0-Pages/Login';



const EmailVerifyPage = ({navigation, route}:LoginProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const formInputRef = useRef<FormSubmit>(null);

    //Verify & Complete Login
    const onSubmitEmailVerification = async(formValues:Record<string, InputTypesAllowed>) => {
        axios.post(`${DOMAIN}/api/email-verify`, formValues).then(async(response:AxiosResponse<LoginResponseBody>) => {
            dispatch(setAccount({
              jwt: response.data.jwt,
              userID: response.data.userID,
              userProfile: response.data.userProfile,
            }));

            dispatch(registerNotificationDevice); // asynchronous, don't need to wait
            navigation.navigate(ROUTE_NAMES.LOGO_ANIMATION_ROUTE_NAME, { ...route.params });
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }


    return (
      <SafeAreaView style={styles.page}>
        <View style={theme.background_view}>
            <Text allowFontScaling={false} style={styles.header}>Verify Email</Text>
              <FormInput 
                fields={EMAIL_VERIFY_PROFILE_FIELDS.filter((field:InputField)=>field.environmentList.includes(getEnvironment()))}
                defaultValues={{ email: route.params?.email ?? '' }}
                modelIDFieldDetails={({ modelIDField: 'userID', modelID: -1 })}
                onSubmit={onSubmitEmailVerification}
                ref={formInputRef}
              />
              <Raised_Button buttonStyle={styles.submit_button}
                text='Verify'
                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
              />
        </View>
        <BackButton navigation={navigation} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
      </SafeAreaView>
        
    );
}


const styles = StyleSheet.create({
  ...theme,
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.black
    },
    page: {
        ...theme.background_view
    },
    header: {
        ...theme.header,
        marginVertical: 20
    },
    submit_button: {
        marginVertical: 15
    }
});

export default EmailVerifyPage;