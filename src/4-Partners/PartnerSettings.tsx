import { DOMAIN } from "@env";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity } from "react-native";
import { CallbackParam, PROFILE_IMAGE_MIME_TYPES, StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState, updateProfileImage } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { Dropdown_Select, Outline_Button, Raised_Button } from "../widgets";
import { ProfileImage } from "../widgets";
import { PendingPrayerPartnerListItem, PrayerPartnerListItem } from "./partner-widgets";
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types";
import { SelectListItem } from "react-native-dropdown-select-list";
import { ParamListBase } from '@react-navigation/native';
import { PARTNERSHIP_CONTRACT, PartnerStatusEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { LabelListItem } from '../TypesAndInterfaces/config-sync/input-config-sync/search-config';
import Ionicons from "react-native-vector-icons/Ionicons";
import { RecipientFormViewMode } from '../Widgets/RecipientIDList/recipient-types';

// pending partner acceptance, full partner, pending user
const enum PartnerSettingsViewMode {
  PARTNER_LIST = "PARTNER_LIST",
  PENDING_PARTNERS = "PENDING_BOTH",
}

const enum PartnerStatusViewMode {
    PENDING_ACCEPTANCE = "Pending Acceptance",
    PENDING_PARTNERS = "Pending Partners"
}

const PartnerSettings = ({callback}:CallbackParam):JSX.Element => {
    const dispatch = useAppDispatch();

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

    const [partnerSettingsViewMode, setPartnerSettingsViewMode] = useState<PartnerSettingsViewMode>(PartnerSettingsViewMode.PARTNER_LIST);
    const [partnerStatusViewMode, setPartnerStatusViewMode] = useState<PartnerStatusViewMode>(PartnerStatusViewMode.PENDING_ACCEPTANCE);
    const [newPartnerModalVisible, setNewPartnerModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
        }
    }

    const generateDropdownSelectData = () => {
        const dropdownSelectData:SelectListItem[] = [];
        if (pendingPrayerPartnerUsers !== undefined && pendingPrayerPartnerUsers.length > 0) dropdownSelectData.push({key: PartnerStatusViewMode.PENDING_PARTNERS, value: PartnerStatusViewMode.PENDING_PARTNERS});
        if (pendingPrayerPartners !== undefined && pendingPrayerPartners.length > 0) dropdownSelectData.push({key: PartnerStatusViewMode.PENDING_ACCEPTANCE, value: PartnerStatusViewMode.PENDING_ACCEPTANCE});
        return dropdownSelectData;
    }

    const renderPartners = ():JSX.Element[] => 
        (prayerPartnersList || []).map((partner:PartnerListItem, index:number) => 
            <PrayerPartnerListItem partner={partner} key={index} leavePartnership={leavePartnership} />
    );

    const renderPendingPartners = (partnerList:PartnerListItem[] | undefined, pendingContract:boolean):JSX.Element[] => 
        (partnerList || []).map((partner:PartnerListItem, index:number) => 
            <PendingPrayerPartnerListItem partner={partner} key={index} pendingContract={pendingContract} declinePartnershipRequest={declinePartnershipRequest} acceptPartnershipRequest={acceptPartnershipRequest} setNewPartner={setNewPartner} setNewPartnerModalVisible={setNewPartnerModalVisible}/>
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
        }).catch((error:AxiosError) => console.log(error));
    }

    const declinePartnershipRequest = (partner:PartnerListItem) => {
        axios.delete(`${DOMAIN}/api/partner-pending/`+ partner.userID + '/decline', RequestAccountHeader).then((response:AxiosResponse) => {
            (partner.status == PartnerStatusEnum.PENDING_CONTRACT_PARTNER) ? setPendingPrayerPartners([...pendingPrayerPartners].filter((partner:PartnerListItem) => partner.userID !== partner.userID)) : setPendingPrayerPartnerUsers([...pendingPrayerPartnerUsers].filter((partner:PartnerListItem) => partner.userID !== partner.userID));
        }).catch((error:AxiosError) => console.log(error));
    }

    const leavePartnership = (partner:PartnerListItem) => {
        axios.delete(`${DOMAIN}/api/partner/` + partner.userID + '/leave', RequestAccountHeader).then((response:AxiosResponse) => {
            setPrayerPartnersList([...prayerPartnersList].filter((partner:PartnerListItem) => partner.userID !== partner.userID));
        }).catch((error:AxiosError) => console.log(error));
    }

    const GET_PendingPartners = () => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/partner-pending-list', RequestAccountHeader).then((response:AxiosResponse) => {
            const pendingUsers:PartnerListItem[] = [];
            const pendingPartners:PartnerListItem[] = [];
            const newPendingPartners:PartnerListItem[] = response.data;
            newPendingPartners.forEach((partner:PartnerListItem) => (partner.status == PartnerStatusEnum.PENDING_CONTRACT_BOTH || partner.status == PartnerStatusEnum.PENDING_CONTRACT_USER) ? pendingUsers.push(partner) : pendingPartners.push(partner));
            setPendingPrayerPartnerUsers(pendingUsers);
            setPendingPrayerPartners(pendingPartners);
        }).catch((error:AxiosError) => console.log(error));
    }

    const GET_PrayerPartners = () => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/partner-list?status=PARTNER', RequestAccountHeader).then((response:AxiosResponse) => {
            const prayerPartners:PartnerListItem[] = response.data;
            setPrayerPartnersList(prayerPartners);
        }).catch((error:AxiosError) => console.log(error));
    }

    const POST_NewPartner = async () => {
        axios.post(`${DOMAIN}/api/user/` + userID + '/new-partner', {}, RequestAccountHeader).then((response:AxiosResponse) => {
            setNewPartner(response.data as PartnerListItem);
            setPendingPrayerPartnerUsers([...pendingPrayerPartnerUsers, response.data as PartnerListItem]);
            setNewPartnerModalVisible(true);
        }).catch((error:AxiosError) => console.log(error)); // toast notification: "Will be notified soon when partner becomes available"
    }

    const renderPendingPage = ():JSX.Element => {
        const dropdownSelectData:SelectListItem[] = generateDropdownSelectData();
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
        // TODO - pull calls to GET partners to run once on component load
        GET_PrayerPartners();
        GET_PendingPartners();
    }, [])

    return (
        <View style={styles.backgroundColor}>
            <View style={styles.container}>
                <View style={styles.viewModeView}>
                        <TouchableOpacity
                            onPress={() => {
                                if (partnerSettingsViewMode !== PartnerSettingsViewMode.PARTNER_LIST) {
                                    setPartnerSettingsViewMode(PartnerSettingsViewMode.PARTNER_LIST);
                                }
                            }}
                        >
                            <Text style={(partnerSettingsViewMode == PartnerSettingsViewMode.PARTNER_LIST && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Partners</Text>
                        </TouchableOpacity>
                        <Text style={styles.viewModeTextSelected}>|</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (partnerSettingsViewMode !== PartnerSettingsViewMode.PENDING_PARTNERS) {
                                    setPartnerSettingsViewMode(PartnerSettingsViewMode.PENDING_PARTNERS);
                                }
                            }}
                        >
                            <Text style={(partnerSettingsViewMode == PartnerSettingsViewMode.PENDING_PARTNERS && styles.viewModeTextSelected) || styles.viewModeTextNotSelected}>Pending</Text>
                        </TouchableOpacity>

                    
                </View>
            </View>
            { partnerSettingsViewMode == PartnerSettingsViewMode.PARTNER_LIST ? renderPartners() : renderPendingPage()}
            {
                (maxPartners > (prayerPartnersList.length + pendingPrayerPartnerUsers.length + pendingPrayerPartners.length)) &&
                <View style={styles.bottomView}>             
                    <Raised_Button buttonStyle={{marginVertical: 15}}
                        text='New Partner'
                        onPress={() => POST_NewPartner()} 
                    />
                </View>   
            }

            <Modal 
                visible={newPartnerModalVisible}
                onRequestClose={() => setNewPartnerModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <View style={styles.modalView}>
                    <View style={styles.newPartnerView}>
                        <Text style={styles.newPartnerTitle}>New Prayer Partner</Text>
                        <Text style={styles.newPartnerText}>{PARTNERSHIP_CONTRACT(userProfile.displayName, newPartner?.displayName || "")}</Text>
                        <Raised_Button 
                            text={"Accept Partnership"}
                            onPress={() => {acceptPartnershipRequest(newPartner); setNewPartnerModalVisible(false)}}
                        />
                        <Outline_Button 
                            text={"Decline"}
                            onPress={() => {declinePartnershipRequest(newPartner); setNewPartnerModalVisible(false)}}
                        />
                    </View>
                </View>
            </Modal>
            <View style={styles.backButtonView}>
                <TouchableOpacity
                    onPress={() => callback()}
                >
                    <View style={styles.backButton}>
                    <Ionicons 
                        name="return-up-back-outline"
                        color={COLORS.white}
                        size={30}
                    />
                    </View>
                </TouchableOpacity>
            </View>
      </View>
     
  )

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
  backButton: {
    //position: "absolute",
    justifyContent: "center",
    //alignContent: "center",
    alignItems: "center",
    //bottom: 1,
    //right: 1,
    height: 55,
    width: 55,
    //backgroundColor: COLORS.accent,
    borderRadius: 15,
},
backButtonView: {
    position: "absolute",
    top: 1,
    left: 1
},
})

export default PartnerSettings;