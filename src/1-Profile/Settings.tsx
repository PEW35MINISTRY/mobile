import React, { useState } from 'react';
import { StyleSheet, View, TextStyle, Text, Modal, Linking } from 'react-native';
import theme, { FONT_SIZES } from '../theme';
import { Outline_Button, Raised_Button } from '../widgets';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import { PARTNERSHIP_CONTRACT } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import Partnerships from '../4-Partners/Partnerships';
import { DOMAIN } from '@env';
import axios, { AxiosError } from 'axios';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import ToastQueueManager from '../utilities/ToastQueueManager';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/toast-types';

const ProfileSettings = ({navigation}:StackNavigationProps):JSX.Element => {

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const [partnerModalVisible, setPartnerModalVisible] = useState(false);
    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const onLogout = () => {
        axios.post(`${DOMAIN}/api/logout`, {}, RequestAccountHeader).then((response) => {
            navigation.popToTop();
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error: error}))
    }

    return (
       <View style={styles.background}>
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
                <Raised_Button 
                    text="Logout"
                    onPress={onLogout}
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
                    navigation={navigation} callback={() => setPartnerModalVisible(false)}
                />
            </Modal>
       </View>
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