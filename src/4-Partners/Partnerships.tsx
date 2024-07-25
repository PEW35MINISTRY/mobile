import { DOMAIN } from "@env";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity } from "react-native";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { BackButton, Dropdown_Select, Outline_Button, Raised_Button } from "../widgets";
import { PartnershipContractModal, PendingPrayerPartnerListItem, PrayerPartnerListItem } from "./partnership-widgets";
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types";
import { PartnerStatusEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/toast-types";
import ToastQueueManager from "../utilities/ToastQueueManager";
import { RootSiblingParent } from 'react-native-root-siblings';

// pending partner acceptance, full partner, pending user
const enum PartnerViewMode {
  PARTNER_LIST = "PARTNER_LIST",
  PENDING_PARTNERS = "PENDING_BOTH",
}

const Partnerships = (props:{callback?:(() => void), navigation:NativeStackNavigationProp<any, string, undefined>, continueNavigation?:boolean}):JSX.Element => {

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const maxPartners = useAppSelector((state: RootState) => state.account.userProfile.maxPartners);

    const [prayerPartnersList, setPrayerPartnersList] = useState<PartnerListItem[]>([]);
    const [pendingPrayerPartners, setPendingPrayerPartners] =  useState<PartnerListItem[]>([]);
    const [pendingPrayerPartnerUsers, setPendingPrayerPartnerUsers] = useState<PartnerListItem[]>([]);
    const [newPartner, setNewPartner] = useState<PartnerListItem>({
        status: PartnerStatusEnum.FAILED,
        userID: -1,
        firstName: "",
        displayName: ""
    } as PartnerListItem);

    const [partnerSettingsViewMode, setPartnerSettingsViewMode] = useState<PartnerViewMode>(PartnerViewMode.PARTNER_LIST);
    const [newPartnerModalVisible, setNewPartnerModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
        }
    }

    const renderPartners = ():JSX.Element[] => 
        (prayerPartnersList || []).map((partner:PartnerListItem, index:number) => 
            <PrayerPartnerListItem partner={partner} key={index} leavePartnership={leavePartnership} />
    );

    const renderPendingPartners = (partnerList:PartnerListItem[] | undefined, pendingContract:boolean):JSX.Element[] => 
        (partnerList || []).map((partner:PartnerListItem, index:number) => 
            <PendingPrayerPartnerListItem partner={partner} key={index} buttonText={pendingContract ? 'View Contract' : 'Decline'}
                onButtonPress={(id, partnerItem) => { pendingContract ? acceptPartnershipRequest(partnerItem) : declinePartnershipRequest(partnerItem);
                    setNewPartnerModalVisible(true); }} />
    );

    const acceptPartnershipRequest = (partner:PartnerListItem) => {
        axios.post(`${DOMAIN}/api/partner-pending/`+ partner.userID + '/accept', {}, RequestAccountHeader).then((response:AxiosResponse) => {

            const responsePartnerListItem:PartnerListItem = response.data as PartnerListItem;
            const newPartner:PartnerListItem = {
                ...partner,
                status: responsePartnerListItem.status
            }

            setPendingPrayerPartnerUsers([...pendingPrayerPartnerUsers].filter((partnerItem:PartnerListItem) => partner.userID !== partnerItem.userID));

            if (newPartner.status == PartnerStatusEnum.PENDING_CONTRACT_PARTNER) setPendingPrayerPartners([...pendingPrayerPartners, partner]);
            else if (newPartner.status == PartnerStatusEnum.PARTNER) setPrayerPartnersList([...prayerPartnersList, partner]);
            else console.warn("unexpected new partner state")
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const declinePartnershipRequest = (partner:PartnerListItem) => {
        axios.delete(`${DOMAIN}/api/partner-pending/`+ partner.userID + '/decline', RequestAccountHeader).then((response:AxiosResponse) => {
            (partner.status == PartnerStatusEnum.PENDING_CONTRACT_PARTNER) ? setPendingPrayerPartners([...pendingPrayerPartners].filter((partner:PartnerListItem) => partner.userID !== partner.userID)) : setPendingPrayerPartnerUsers([...pendingPrayerPartnerUsers].filter((partner:PartnerListItem) => partner.userID !== partner.userID));
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const leavePartnership = (partner:PartnerListItem) => {
        axios.delete(`${DOMAIN}/api/partner/` + partner.userID + '/leave', RequestAccountHeader).then((response:AxiosResponse) => {
            setPrayerPartnersList([...prayerPartnersList].filter((partner:PartnerListItem) => partner.userID !== partner.userID));
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const GET_PendingPartners = () => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/partner-pending-list', RequestAccountHeader).then((response:AxiosResponse) => {
            const pendingUsers:PartnerListItem[] = [];
            const pendingPartners:PartnerListItem[] = [];
            const newPendingPartners:PartnerListItem[] = response.data;
            newPendingPartners.forEach((partner:PartnerListItem) => (partner.status == PartnerStatusEnum.PENDING_CONTRACT_BOTH || partner.status == PartnerStatusEnum.PENDING_CONTRACT_USER) ? pendingUsers.push(partner) : pendingPartners.push(partner));
            setPendingPrayerPartnerUsers(pendingUsers);
            setPendingPrayerPartners(pendingPartners);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const GET_PrayerPartners = () => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/partner-list?status=PARTNER', RequestAccountHeader).then((response:AxiosResponse) => {
            const prayerPartners:PartnerListItem[] = response.data;
            setPrayerPartnersList(prayerPartners);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const POST_NewPartner = async () => {
        axios.post(`${DOMAIN}/api/user/` + userID + '/new-partner', {}, RequestAccountHeader).then((response:AxiosResponse) => {
            setNewPartner(response.data as PartnerListItem);
            setPendingPrayerPartnerUsers([...pendingPrayerPartnerUsers, response.data as PartnerListItem]);
            setNewPartnerModalVisible(true);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const renderPendingPage = ():JSX.Element => {
        return (
            <View style={{flex: 1}}>
                {
                    pendingPrayerPartnerUsers.length > 0 && (
                        <View style={styles.partnerListSpacing}>
                            <Text style={styles.partnerStatusViewModeTitle}>Pending Partners</Text>
                            <ScrollView style={styles.partnerList} >
                                {renderPendingPartners(pendingPrayerPartnerUsers, true)}
                            </ScrollView>
                        </View>
                    )
                }
                {
                    pendingPrayerPartners.length > 0 && (
                        <View style={styles.partnerListSpacing}>
                            <Text style={styles.partnerStatusViewModeTitle}>Pending Acceptance</Text>
                            <ScrollView style={styles.partnerList} >
                                {renderPendingPartners(pendingPrayerPartners, false)}
                            </ScrollView>
                        </View>
                    )
                }
            </View>

        )
    }

    useEffect(() => {
        GET_PrayerPartners();
        
    }, [])

    useEffect(() => {
        GET_PendingPartners();
    }, [])

    return (
        <RootSiblingParent>
            <View style={styles.backgroundColor}>
                <View style={styles.container}>
                    <View style={styles.viewModeView}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (partnerSettingsViewMode !== PartnerViewMode.PARTNER_LIST) {
                                        setPartnerSettingsViewMode(PartnerViewMode.PARTNER_LIST);
                                    }
                                }}
                            >
                                <Text style={(partnerSettingsViewMode == PartnerViewMode.PARTNER_LIST && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Partners</Text>
                            </TouchableOpacity>
                            <Text style={styles.viewModeTextSelected}>|</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    if (partnerSettingsViewMode !== PartnerViewMode.PENDING_PARTNERS) {
                                        setPartnerSettingsViewMode(PartnerViewMode.PENDING_PARTNERS);
                                    }
                                }}
                            >
                                <Text style={(partnerSettingsViewMode == PartnerViewMode.PENDING_PARTNERS && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Pending</Text>
                            </TouchableOpacity>

                        
                    </View>
                </View>
                { partnerSettingsViewMode == PartnerViewMode.PARTNER_LIST ? renderPartners() : renderPendingPage()}
                {
                    (maxPartners > (prayerPartnersList.length + pendingPrayerPartnerUsers.length + pendingPrayerPartners.length)) &&
                    <View style={styles.bottomView}>          
                        <Outline_Button 
                            text='New Partner'
                            onPress={() => POST_NewPartner()} 
                        />   
                        <Raised_Button buttonStyle={{marginVertical: 15}}
                            text='Done'
                            onPress={() => props.callback !== undefined && props.callback()} 
                        />
                    </View>   
                }

                <PartnershipContractModal
                    visible={newPartnerModalVisible}
                    partner={newPartner}
                    acceptPartnershipRequest={() => {acceptPartnershipRequest(newPartner); setNewPartnerModalVisible(false)}}
                    declinePartnershipRequest={() => {declinePartnershipRequest(newPartner); setNewPartnerModalVisible(false)}}
                    onClose={() => setNewPartnerModalVisible(false)}
                />

                <BackButton navigation={props.navigation} callback={props.callback}/>
            </View>
        </RootSiblingParent>       
     
  );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: COLORS.black,
    alignItems: "center",
  },
  partnerListSpacing: {
    marginVertical: 5,
  },
  bottomView: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center"
  },
  partnerStatusViewModeTitle: {
    ...theme.title,
    fontSize: FONT_SIZES.M+5,
    color: COLORS.white,
    textAlign: "center"
  },
  backgroundColor: {
      backgroundColor: COLORS.black,
      flex: 1,
  },
  viewModeView: {
      flexDirection: "row",
      top: 15,
      marginBottom: 25
  },
  viewModeTextSelected: {
      ...theme.title,
      textAlign: "center",
      marginHorizontal: 10
  },
  viewModeTextNotSelected: {
      ...theme.title,
      textAlign: "center",
      marginHorizontal: 10,
      color: COLORS.grayDark
  },
  partnerList: {
    height: '40%',
    marginTop: 'auto',
  },

})

export default Partnerships;