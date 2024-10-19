import React, { useState } from 'react';
import keychain from 'react-native-keychain'
import { StyleSheet, View, TextStyle, Text, Modal, Linking, SafeAreaView, Platform } from 'react-native';
import theme, { FONT_SIZES } from '../theme';
import { BackButton, Outline_Button, Raised_Button } from '../widgets';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import Partnerships from '../4-Partners/Partnerships';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { resetAccount, RootState, setAccount, setContacts, setSettings, setStorageState, updateProfile } from '../redux-store';
import { DOMAIN, ENVIRONMENT } from '@env';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

const ProfileSettings = ({navigation}:StackNavigationProps):JSX.Element => {

    const dispatch = useAppDispatch();

    const account = useAppSelector((state: RootState) => state.account);
    const [partnerModalVisible, setPartnerModalVisible] = useState(false);
    const RequestAccountHeader = {
        headers: {
          "jwt": account.jwt, 
        }
      }

    const onLogout = () => {
        dispatch(resetAccount());
        navigation.popToTop();
        navigation.navigate(ROUTE_NAMES.LOGIN_ROUTE_NAME)
    }

    const onResetStorageState = () => {
        // After calling, just reload the app
        keychain.resetGenericPassword();
    }

    return (
       <SafeAreaView style={styles.background}>
            <Text style={styles.headerText}>Settings</Text>
            <View style={styles.settingsButtonsView}>
                <Outline_Button 
                    text={"Edit Profile"}
                    onPress={() => navigation.navigate(ROUTE_NAMES.EDIT_PROFILE_ROUTE_NAME)}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text={"Partner Settings"}
                    onPress={() => setPartnerModalVisible(true)}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text={"Update Contacts"}
                    onPress={ async () => axios.post(`${DOMAIN}/api/user/` + account.userID + '/update-contacts', {}, RequestAccountHeader).then((response:AxiosResponse) => dispatch(setContacts(response.data))).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}))}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text={"Refresh Profile"}
                    onPress={ async () => axios.get(`${DOMAIN}/api/user/` + account.userID, RequestAccountHeader).then((response:AxiosResponse) => dispatch(updateProfile(response.data))).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}))}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text={"Portal Login"}
                    onPress={() => Linking.openURL("https://encouragingprayer.org/login")}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text="Give feedback"
                    onPress={() => console.log("TODO: leave feedback")}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text="Help / Report Issue"
                    onPress={() => console.log("TODO: Help / Report Issue")}
                    buttonStyle={styles.settingsButton}
                />
                <Outline_Button 
                    text="Donate"
                    onPress={() => Linking.openURL("https://pew35.org/support")}
                    buttonStyle={styles.settingsButton}
                />
                {
                    ENVIRONMENT === "DEVELOPMENT" && 
                        <Outline_Button 
                            text="Reset Local Storage State"
                            onPress={() => onResetStorageState()}
                            buttonStyle={styles.settingsButton}
                        />
                }
                <Raised_Button 
                    text="Logout"
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
            <BackButton navigation={navigation} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
       </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        //justifyContent: "center",
        alignItems: "center",
        color: "black",
        backgroundColor: "black"
    },
    settingsButtonsView: {
        //justifyContent: "flex-start",
        marginTop: 30,
        alignItems: "center",
    },
    headerText: {
        ...theme.header,
        fontSize: FONT_SIZES.XL,
        top: 10
    },
    settingsButton: {
        borderRadius: 5, 
        minWidth: '90%',
        marginVertical: 8
    }
});

export default ProfileSettings;