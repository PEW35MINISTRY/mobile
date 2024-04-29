import theme, { FONT_SIZES, COLORS } from "../theme";
import { DOMAIN } from '@env';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types"
import { RequestorProfileImage } from "../1-Profile/profile-widgets";
import axios, { AxiosError, AxiosResponse } from "axios";
import { RootState } from "../redux-store";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { PartnerStatusEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { Outline_Button } from "../widgets";

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

export const PendingPrayerPartnerListItem = (props:{partner:PartnerListItem, declinePartnershipRequest:((partner:PartnerListItem) => void), pendingContract:boolean, acceptPartnershipRequest:((partner:PartnerListItem) => void), setNewPartner: React.Dispatch<React.SetStateAction<PartnerListItem>>, setNewPartnerModalVisible: React.Dispatch<React.SetStateAction<boolean>>}):JSX.Element => {
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
        <View style={styles.container}>
            <View style={styles.prayerRequestDataTopView}>
                <RequestorProfileImage style={{height: 40, width: 40}} imageUri={props.partner.image} userID={props.partner.userID}/>
                <View style={styles.middleData}>
                    <Text style={styles.nameText}>{props.partner.displayName}</Text>
                </View>
                <View style={styles.ShareButtonTopLevelView}>
                    {props.pendingContract ? 
                        <>
                            <TouchableOpacity 
                                onPress={() => {props.setNewPartner(props.partner); props.setNewPartnerModalVisible(true)}}
                            >  
                                <View style={styles.contractButtonView}>
                                    <Text style={styles.textStyle}>View Contract</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                        :
                        <>
                            <TouchableOpacity 
                                onPress={() => console.log("TODO: send notification")}
                            >  
                                <View style={styles.contractButtonView}>
                                    <Text style={styles.textStyle}>Send Reminder</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    
                    }

                </View>
            </View>
        </View>
    )
}