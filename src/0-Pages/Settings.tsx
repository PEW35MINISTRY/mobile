import React, { useEffect, useState } from 'react';
import keychain from 'react-native-keychain'
import { StyleSheet, View, TextStyle, Text, Modal, Linking, SafeAreaView, Platform, ScrollView } from 'react-native';
import theme, { FONT_SIZES } from '../theme';
import { BackButton, CheckBox, Flat_Button, Outline_Button, Raised_Button } from '../widgets';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import Partnerships from '../4-Partners/Partnerships';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { AccountState, clearSettings, resetAccount, resetJWT, resetSettings, RootState, setAccount, setContacts, setSettings, SettingsState, updateProfile } from '../redux-store';
import { DOMAIN, ENVIRONMENT } from '@env';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';
import Devices from '../1-Profile/Devices';
import { ENVIRONMENT_TYPE } from '../TypesAndInterfaces/config-sync/input-config-sync/inputField';
import { getEnvironment } from '../utilities/utilities';

const ProfileSettings = ({navigation}:StackNavigationProps):JSX.Element => {

    const dispatch = useAppDispatch();
    const settingsRef:SettingsState = useAppSelector((state: RootState) => state.settings);
    const account:AccountState = useAppSelector((state: RootState) => state.account);

    const [partnerModalVisible, setPartnerModalVisible] = useState(false);
    const [notificationDeviceModalVisible, setNotificationDeviceModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          'jwt': account.jwt, 
        }
      }

    const onLogout = () => {
        dispatch(resetAccount());
        dispatch(resetJWT());
        dispatch(clearSettings());
        navigation.popToTop();
        navigation.navigate(ROUTE_NAMES.LOGIN_ROUTE_NAME);
    }

    return (
       <SafeAreaView style={styles.background}>
            <Text allowFontScaling={false} style={styles.headerText}>Settings</Text>
            <Flat_Button
                text='Email Support | (Report an Issue)'
                onPress={() => Linking.openURL(
                    `mailto:support@encouragingprayer.org`
                        + `?subject=${encodeURIComponent(`#${account.userID} | EP Mobile App Help`)}`
                        + `&body=${encodeURIComponent(`User: ${account.userID} | ${account.userProfile.displayName} | ${account.userProfile.email}\nDate: ${new Date().toISOString()}\n\nEP Support,\n\n`)}`
                )}
                buttonStyle={styles.settingsButton}
            />

            <ScrollView contentContainerStyle={styles.settingsButtonsView}>

                <Text style={styles.sectionHeaderText}>App Navigation</Text>
                <Outline_Button 
                    text={'Edit Profile'}
                    onPress={() => navigation.navigate(ROUTE_NAMES.EDIT_PROFILE_ROUTE_NAME)}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text={'Partnerships'}
                    onPress={() => setPartnerModalVisible(true)}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text={'Notification Devices'}
                    onPress={() => setNotificationDeviceModalVisible(true)}
                    buttonStyle={styles.settingsButton}
                />

                <Text style={styles.sectionHeaderText}>Ministry</Text>
                <Outline_Button 
                    text={'Portal Login'}
                    onPress={() => Linking.openURL('https://encouragingprayer.org/login')}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text='About PEW35'
                    onPress={() => Linking.openURL('https://pew35.org/mission-and-vision')}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text='Our Team'
                    onPress={() => Linking.openURL('https://pew35.org/mission-and-vision/#team')}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text='Donate'
                    onPress={() => Linking.openURL('https://pew35.org/support')}
                    buttonStyle={styles.settingsButton}
                />

                <Text style={styles.sectionHeaderText}>Policies</Text>
                <Outline_Button 
                    text='Terms of Use'
                    onPress={() => Linking.openURL('https://ep-cdn-data-prod.s3.us-east-2.amazonaws.com/EP_Terms_Of_Use.pdf')}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text='Privacy Policy'
                    onPress={() => Linking.openURL('https://ep-cdn-data-prod.s3.us-east-2.amazonaws.com/EP_Privacy_Policy.pdf')}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text='Youth Protection'
                    onPress={() => Linking.openURL('https://ep-cdn-data-prod.s3.us-east-2.amazonaws.com/EP_Youth_Protection_Policy.pdf')}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text='Delete Account'
                    onPress={() => Linking.openURL('https://encouragingprayer.org/delete-account')}
                    buttonStyle={styles.settingsButton}
                />


                {
                    // [ENVIRONMENT_TYPE.LOCAL, ENVIRONMENT_TYPE.DEVELOPMENT].includes(getEnvironment()) && //Disable after Beta
                    <>
                        <Text style={styles.sectionHeaderText}>Debug Utilities</Text>
                        <Outline_Button 
                            text={'Update Contacts'}
                            onPress={ async () => axios.post(`${DOMAIN}/api/user/` + account.userID + '/update-contacts', {}, RequestAccountHeader).then((response:AxiosResponse) => dispatch(setContacts(response.data))).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}))}
                            buttonStyle={styles.settingsButton}
                        />
                        <Outline_Button 
                            text={'Refresh Profile'}
                            onPress={ async () => axios.get(`${DOMAIN}/api/user/` + account.userID, RequestAccountHeader).then((response:AxiosResponse) => dispatch(updateProfile(response.data))).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}))}
                            buttonStyle={styles.settingsButton}
                        />
                        <Outline_Button 
                            text='Update Authentication'
                            onPress={() => dispatch(resetJWT())}
                            buttonStyle={styles.settingsButton}
                        />
                        <Outline_Button 
                            text='Reset Local Settings'
                            onPress={() => dispatch(resetSettings())}
                            buttonStyle={styles.settingsButton}
                        />
                    </>
                }
            </ScrollView>
            <View style={styles.settingsButtonsView}>
                <View style={{marginVertical: 10}}>
                    <CheckBox onChange={(value) => dispatch(setSettings({...settingsRef, skipAnimation: value}))} label='Skip logo animation on login' initialState={settingsRef.skipAnimation} />
                </View>
                <Raised_Button 
                    text='Logout'
                    onPress={() => onLogout()}
                    buttonStyle={styles.settingsButton}
                />
            </View>
            <Modal 
                visible={partnerModalVisible}
                onRequestClose={() => setPartnerModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <Partnerships 
                    callback={() => setPartnerModalVisible(false)}
                />
            </Modal>
            <Modal 
                visible={notificationDeviceModalVisible}
                onRequestClose={() => setNotificationDeviceModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <Devices callback={() => setNotificationDeviceModalVisible(false)}/>
            </Modal>
            <BackButton navigation={navigation} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
       </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        color: 'black',
        backgroundColor: 'black',
        alignItems: 'center',

    },
    settingsButtonsView: {
        marginHorizontal: 5,
    },
    headerText: {
        ...theme.header,
        fontSize: FONT_SIZES.XL,

        alignSelf: 'center',
        top: 10,
        marginBottom: 20
    },
    sectionHeaderText: {
        ...theme.title,

        alignSelf: 'flex-start',
        marginTop: 15,
    },
    settingsButton: {
        borderRadius: 5, 
        minWidth: '90%',
        marginVertical: 8
    }
});

export default ProfileSettings;