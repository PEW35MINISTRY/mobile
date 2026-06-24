import theme, { FONT_SIZES, COLORS } from "../theme";
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types"
import { RequestorProfileImage } from "../1-Profile/profile-widgets";
import { PARTNERSHIP_CONTRACT_BLURB } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { Confirmation, Raised_Button, ReportButton } from "../widgets";
import Toast from "react-native-toast-message";

export const PrayerPartnerListItem = (props:{partner:PartnerListItem, onButtonPress?:(id:number, partner:PartnerListItem) => void, onAltButtonPress?:(id:number, partner:PartnerListItem) => void}):JSX.Element => {
    
    const [leaveModalVisible, setLeaveModalVisible] = useState<boolean>(false);
    const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);

    const styles = StyleSheet.create({
        container: {
            marginLeft: 25,
            marginVertical: 10,
            marginRight: 10
        },
        nameText: {
            ...theme.header,
            fontSize: 20,
        },
        prayerRequestDataTopView: {
            marginTop: 2,
            flexDirection: "row",
        },
        middleData: {
            flexDirection: "column",
            marginLeft: 10,
        },
        textStyle: {
            ...theme.text,
            fontWeight: '700',
            textAlign: "center",
            color: COLORS.accent
        },
        warningTextStyle: {
            ...theme.text,
            fontWeight: '700',
            textAlign: "center",
            color: COLORS.primary
        },
        shareButtonView:{
            width: 100,
            borderRadius: 5,
        },
        ShareButtonTopLevelView: {
            position: "absolute",
            right: 10,
            flexDirection: "row",
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.prayerRequestDataTopView}>
                <RequestorProfileImage style={{height: 40, width: 40}} imageUri={props.partner.image} userID={props.partner.userID}/>
                <View style={styles.middleData}>
                    <Text allowFontScaling={false} style={styles.nameText}>{props.partner.displayName}</Text>
                </View>
                <View style={styles.ShareButtonTopLevelView}>
                    <View>
                        <ReportButton callback={() => setReportModalVisible(true)} buttonStyle={{ height: 40, width: 40}} buttonView={{justifyContent: "center", alignSelf: "center"}}/>
                    </View>
                    <View>
                        <TouchableOpacity 
                            onPress={() => setLeaveModalVisible(true)}
                        >  
                            <View style={styles.shareButtonView}>
                                <Text allowFontScaling={false} style={styles.textStyle}>Leave Partnership</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
                <Modal 
                    visible={reportModalVisible}
                    onRequestClose={() => setReportModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <Confirmation 
                        callback={() => props.onAltButtonPress && props.onAltButtonPress(props.partner.userID, props.partner) && setReportModalVisible(false)}
                        onCancel={() => setReportModalVisible(false)}
                        promptText={'report this user? This action will end the partnership and send a report to our team for review. \n\nYou will be assigned a new partner.'}
                        buttonText='Report'
                        addPunctuation={false}
                    />
                </Modal>
                <Modal 
                    visible={leaveModalVisible}
                    onRequestClose={() => setLeaveModalVisible(false)}
                    animationType='slide'
                    transparent={true}
                >
                    <Confirmation 
                        callback={() => { props.onButtonPress && props.onButtonPress(props.partner.userID, props.partner); setLeaveModalVisible(false)}}
                        onCancel={() => setLeaveModalVisible(false)}
                        promptText={'leave this partnership'}
                        buttonText='Leave'
                    />
                </Modal>
            </View>
           

        </View>
    )
}

export const PendingPrayerPartnerListItem = (props:{partner:PartnerListItem, buttonText?:string, onButtonPress?:(id:number, partner:PartnerListItem) => void, onPress?:(id:number, item:PartnerListItem) => void}):JSX.Element => {
    const DEFAULT_PROFILE_ICON = require("../../assets/profile-icon-blue.png");

    const styles = StyleSheet.create({
        container: {
            marginLeft: 25,
            marginVertical: 10,
            marginRight: 10
        },
        nameText: {
            ...theme.header,
            fontSize: 20,
        },
        prayerRequestDataTopView: {
            marginTop: 2,
            flexDirection: "row",
        },
        middleData: {
            flexDirection: "column",
            marginLeft: 10,
        },
        textStyle: {
            ...theme.text,
            fontSize: FONT_SIZES.S+2,
            fontWeight: '700',
            textAlign: "center",
            color: COLORS.accent
        },
        declineTextStyle: {
            ...theme.text,
            fontSize: FONT_SIZES.M,
            fontWeight: '700',
            textAlign: "center",
            color: COLORS.primary,
            lineHeight: 40
        },
        declineButtonView:{
            width: 75,
            borderRadius: 5,
        },
        contractButtonView:{
            borderWidth: 1,
            width: 65,
            height: 40,
            borderRadius: 5,
            borderColor: COLORS.accent,
            justifyContent: "center"
        },
        ShareButtonTopLevelView: {
            position: "absolute",
            right: 10,
            justifyContent: "center",
            alignSelf: "center",
            flexDirection: "row",
        },
        defaultProfileIcon: {
            height: 40, 
            width: 40, 
            borderRadius: 15,
            alignSelf: "center",
        }
    });

    return (
        <View style={styles.container} >
            <TouchableOpacity onPress={() => props.onPress && props.onPress(props.partner.userID, props.partner)} > 
                <View style={styles.prayerRequestDataTopView}>
                    <Image style={styles.defaultProfileIcon} 
                        source={DEFAULT_PROFILE_ICON}
                    />
                    <View style={styles.middleData}>
                        <Text allowFontScaling={false} style={styles.nameText}>New Partner</Text>
                    </View>
                    {props.buttonText &&
                        <View style={styles.ShareButtonTopLevelView}>
                            <TouchableOpacity onPress={() => props.onButtonPress && props.onButtonPress(props.partner.userID, props.partner)} >  
                                <View style={{ ...styles.contractButtonView, borderColor: props.buttonText === 'Cancel' ? COLORS.primary : COLORS.accent}}>
                                    <Text allowFontScaling={false} style={{...styles.textStyle, color: props.buttonText === 'Cancel' ? COLORS.white : COLORS.accent}}>{props.buttonText}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </TouchableOpacity>
        </View>
    )
}


export const PartnershipContractModal = ({visible, partner, assignPartnership, onClose}:{visible:boolean, partner:PartnerListItem, 
        assignPartnership:(id:number, item:PartnerListItem) => void, onClose:() => void}) => {
    
    const styles = StyleSheet.create({
        modalView: {
            height: '50%',
            marginTop: 'auto',
            },
            newPartnerView: {
            ...theme.background_view
            },
            newPartnerTitle: {
            ...theme.title,
            textAlign: "center"
            },
            newPartnerText: {
            ...theme.text,
            textAlign: "center",
            maxWidth: '95%',
            fontSize: FONT_SIZES.M+4
            },
        });

    return (
        <Modal 
            visible={visible}
            onRequestClose={() => onClose && onClose()}
            animationType='slide'
            transparent={true}
        >
            <View style={styles.modalView}>
                <View style={styles.newPartnerView}>
                    <Text allowFontScaling={false} style={styles.newPartnerTitle}>New Prayer Partner</Text>
                    <Text allowFontScaling={false} style={styles.newPartnerText}>{PARTNERSHIP_CONTRACT_BLURB}</Text>
                    <Raised_Button 
                        text={'Ok'}
                        onPress={() => assignPartnership(partner.userID, partner)}
                    />
                </View>
            </View>
            <Toast />
        </Modal>
    );
}