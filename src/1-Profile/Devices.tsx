import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TextStyle, Text, Modal, Linking, SafeAreaView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import theme, { COLORS, FONT_SIZES } from '../theme';
import { BackButton, CheckBox, DeleteButton, DeleteConfirmation, Outline_Button, Raised_Button, XButton } from '../widgets';
import { useAppDispatch, useAppSelector } from '../TypesAndInterfaces/hooks';
import { clearSettings, resetAccount, resetJWT, resetSettings, RootState, setAccount, setContacts, setSettings, updateProfile } from '../redux-store';
import { DOMAIN, ENVIRONMENT } from '@env';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootSiblingParent } from 'react-native-root-siblings';

import { FormSubmit } from '../Widgets/FormInput/form-input-types';
import { FormInput } from '../Widgets/FormInput/FormInput';
import { NotificationDeviceListItem } from '../TypesAndInterfaces/config-sync/api-type-sync/notification-types';
import { NOTIFICATION_DEVICE_FIELDS } from '../TypesAndInterfaces/config-sync/input-config-sync/notification-field-config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ServerErrorResponse } from '../TypesAndInterfaces/config-sync/api-type-sync/utility-types';
import ToastQueueManager from '../utilities/ToastQueueManager';

const Devices = (props:{callback?:(() => void)}):JSX.Element => {
    const formInputRef = useRef<FormSubmit>(null);

    const userID = useAppSelector((state: RootState) => state.account.userProfile.userID);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const [devices, setDevices] = useState<NotificationDeviceListItem[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<NotificationDeviceListItem | undefined>();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt, 
        }
      }

    const onNameSubmit = (formValues:Record<string, string | string[]>) => {
        const deviceName = Object.values(formValues)[0];
        if (deviceName !== selectedDevice?.deviceName) axios.patch(`${DOMAIN}/api/user/${userID}/notification/device/${selectedDevice?.deviceID}/device-name`, {deviceName: Object.values(formValues)[0]}, RequestAccountHeader).then((response:AxiosResponse<string>) => {
            if (typeof deviceName === 'string' && selectedDevice !== undefined) {
                const newNotificationDevice = {...selectedDevice, deviceName: deviceName};
                setSelectedDevice(newNotificationDevice);
                setDevices([newNotificationDevice, ...devices.filter((device) => device.deviceID !== newNotificationDevice.deviceID)]);
                ToastQueueManager.show({message: "Device Name Saved"});
                
            }
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const onDeletePress = () => {
        axios.delete(`${DOMAIN}/api/user/${userID}/notification/device/${selectedDevice?.deviceID}`, RequestAccountHeader).then((response:AxiosResponse<string>) => {
            if (selectedDevice !== undefined) {
                setDeleteModalVisible(false);
                setInfoModalVisible(false);
                setDevices(devices.filter((device) => device.deviceID !== selectedDevice.deviceID));
                setSelectedDevice(undefined);
            }
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show(error))
    }

    const renderNotificationDevices = () => devices.map((deviceItem, index) =>             
      <Outline_Button 
        text={deviceItem.deviceName}
        onPress={() => {setSelectedDevice(deviceItem); setInfoModalVisible(true)}}
        buttonStyle={styles.deviceTouchable}
        key={index}
      />
    );

    useEffect(() => {
        axios.get(`${DOMAIN}/api/user/${userID}/notification/device-list`, RequestAccountHeader).then((response:AxiosResponse<NotificationDeviceListItem[]>) => setDevices(response.data))
    }, []);

    return (
        <SafeAreaView style={styles.backgroundColor}>
            <Text allowFontScaling={false} style={styles.header}>Devices</Text>
            <ScrollView contentContainerStyle={styles.container}>
              { devices.length !== 0 ? renderNotificationDevices() : <Text style={styles.noDevicesText}>No notification devices</Text>}
            </ScrollView>
            <Modal
                visible={infoModalVisible}
                onRequestClose={() => setInfoModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <RootSiblingParent>
                    <View style={styles.infoModalView}>
                        <View style={styles.deviceView}>
                            <Text allowFontScaling={false} style={styles.header}>Device Details</Text>
                            <FormInput 
                                fields={NOTIFICATION_DEVICE_FIELDS.filter((field) => field.field === 'deviceName')}
                                defaultValues={{deviceName: selectedDevice !== undefined && selectedDevice.deviceName || ''}}
                                onSubmit={onNameSubmit}
                                ref={formInputRef}
                            />
                            <Raised_Button buttonStyle={styles.sign_in_button}
                                text='Save'
                                onPress={() => formInputRef.current !== null && formInputRef.current.onHandleSubmit()}
                            />
                        </View>
                        <XButton callback={() => setInfoModalVisible(false)}/>
                        <DeleteButton callback={() => setDeleteModalVisible(true)} />
                        <Modal 
                            visible={deleteModalVisible}
                            onRequestClose={() => setDeleteModalVisible(false)}
                            animationType='slide'
                            transparent={true}
                        >
                            <DeleteConfirmation 
                                callback={onDeletePress}
                                onCancel={() => setDeleteModalVisible(false)}
                                itemName={selectedDevice !== undefined && selectedDevice.deviceName || 'This device'}
                            />
                        </Modal>
                    </View>
                </RootSiblingParent>
            </Modal>
            <BackButton callback={() => props.callback !== undefined && props.callback()} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>

            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    backgroundColor: {
        backgroundColor: COLORS.black,
        flex: 1,
    },
    container: {
      backgroundColor: COLORS.black,
      alignItems: "center",
    },
    deviceTouchable: {
      borderRadius: 5, 
      minWidth: '90%',
    },
    noDevicesText: {
        ...theme.title,
        marginTop: 50,
        fontSize: 32,
        textAlign: "center"
    },
    header: {
        ...theme.header,
        marginVertical: 20,
        textAlign: "center",
    },
    infoModalView: {
        height: '68%',
        marginTop: 'auto',
        alignItems: "center",
    },
    deleteModalView: {
        height: '40%',
        marginTop: 'auto',
        alignItems: "center",
    },
    deviceView: {
        ...theme.background_view
    },
    sign_in_button: {
        marginVertical: 15,
        bottom: 20
    },
})

export default Devices;