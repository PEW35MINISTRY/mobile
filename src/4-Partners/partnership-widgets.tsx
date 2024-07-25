import theme, { FONT_SIZES, COLORS } from "../theme";
import { DOMAIN } from '@env';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types"
import { RequestorProfileImage } from "../1-Profile/profile-widgets";
import { RootState } from "../redux-store";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { PARTNERSHIP_CONTRACT } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { Outline_Button, Raised_Button } from "../widgets";

export const PrayerPartnerListItem = (props:{partner:PartnerListItem, leavePartnership:((partner:PartnerListItem) => void)}):JSX.Element => {
    const jwt = useAppSelector((state: RootState) => state.account.jwt);

    const RequestAccountHeader = {
        headers: {
            "jwt": jwt, 
        }
    }
    
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
        shareButtonView:{
            width: 100,
            borderRadius: 5,
        },
        ShareButtonTopLevelView: {
            position: "absolute",
            right: 10,
            justifyContent: "center",
            alignSelf: "center"
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.prayerRequestDataTopView}>
                <RequestorProfileImage style={{height: 40, width: 40}} imageUri={props.partner.image} userID={props.partner.userID}/>
                <View style={styles.middleData}>
                    <Text style={styles.nameText}>{props.partner.displayName}</Text>
                </View>
                <View style={styles.ShareButtonTopLevelView}>
                    <TouchableOpacity 
                        onPress={() => props.leavePartnership(props.partner)}
                    >  
                        <View style={styles.shareButtonView}>
                            <Text style={styles.textStyle}>Leave Partnership</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
           

        </View>
    )
}

export const PendingPrayerPartnerListItem = (props:{partner:PartnerListItem, buttonText?:string, onButtonPress?:(id:number, partner:PartnerListItem) => void, onPress?:(id:number, item:PartnerListItem) => void}):JSX.Element => {

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
        }
    });

    return (
        <View style={styles.container} >
            <TouchableOpacity onPress={() => props.onPress && props.onPress(props.partner.userID, props.partner)} > 
                <View style={styles.prayerRequestDataTopView}>
                    <RequestorProfileImage style={{height: 40, width: 40}} imageUri={props.partner.image} userID={props.partner.userID}/>
                    <View style={styles.middleData}>
                        <Text style={styles.nameText}>{props.partner.displayName}</Text>
                    </View>
                    {props.buttonText &&
                        <View style={styles.ShareButtonTopLevelView}>
                            <TouchableOpacity onPress={() => props.onButtonPress && props.onButtonPress(props.partner.userID, props.partner)} >  
                                <View style={styles.contractButtonView}>
                                    <Text style={styles.textStyle}>{props.buttonText}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </TouchableOpacity>
        </View>
    )
}


export const PartnershipContractModal = ({visible, partner, acceptPartnershipRequest, declinePartnershipRequest, onClose}:{visible:boolean, partner:PartnerListItem, 
        acceptPartnershipRequest:(id:number, item:PartnerListItem) => void, declinePartnershipRequest:(id:number, item:PartnerListItem) => void, onClose:() => void}) => {
    
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);

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
                    <Text style={styles.newPartnerTitle}>New Prayer Partner</Text>
                    <Text style={styles.newPartnerText}>{PARTNERSHIP_CONTRACT(userProfile.displayName, partner.displayName || '')}</Text>
                    <Raised_Button 
                        text={'Accept Partnership'}
                        onPress={() => acceptPartnershipRequest(partner.userID, partner)}
                    />
                    <Outline_Button 
                        text={'Decline'}
                        onPress={() => declinePartnershipRequest(partner.userID, partner)}
                    />
                </View>
            </View>
        </Modal>
    );
}