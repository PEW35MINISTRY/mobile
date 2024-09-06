import React, { useState } from 'react';
import { StyleSheet, View, TextStyle, Text, Modal, Linking, SafeAreaView, Platform } from 'react-native';
import theme, { FONT_SIZES } from '../theme';
import { BackButton, Outline_Button, Raised_Button } from '../widgets';
import { StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import Partnerships from '../4-Partners/Partnerships';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { resetAccount, RootState, setAccount } from '../redux-store';

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
        navigation.pop();
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
                    text={"Circles"}
                    onPress={() => navigation.navigate(ROUTE_NAMES.CIRCLE_LIST_ROUTE_NAME)}
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
                    navigation={navigation} callback={() => setPartnerModalVisible(false)}
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