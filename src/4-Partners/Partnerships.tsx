import { DOMAIN, NEW_PARTNER_REQUEST_TIMEOUT } from "@env";
import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { addPartner, addPartnerPendingPartner, removePartner, removePartnerPendingPartner, removePartnerPendingUser, RootState, setPartnerPendingPartners, setPartnerPendingUsers, setPartners, setSettings } from "../redux-store";
import theme, { COLORS, FONT_SIZES } from "../theme";
import { BackButton, Dropdown_Select, Filler, Outline_Button, Raised_Button } from "../widgets";
import { PartnershipContractModal, PendingPrayerPartnerListItem, PrayerPartnerListItem } from "./partnership-widgets";
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types";
import { PartnerStatusEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";
import NewPartner from "../0-Pages/NewPartner";
import Toast from "react-native-toast-message";
import SearchList from "../Widgets/SearchList/SearchList";
import { SearchListKey, SearchListValue } from "../Widgets/SearchList/searchList-types";
import { DisplayItemType, ListItemTypesEnum, SearchType } from "../TypesAndInterfaces/config-sync/input-config-sync/search-config";
import { CALLBACK_STATE } from "../TypesAndInterfaces/custom-types";


const Partnerships = (props:{callback?:((state:CALLBACK_STATE) => void), continueNavigation?:boolean}):JSX.Element => {

    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfilePartners = useAppSelector((state: RootState) => state.account.userProfile.partnerList);
    const userProfilePendingPartners = useAppSelector((state: RootState) => state.account.userProfile.partnerPendingPartnerList);
    const userProfilePendingUsers = useAppSelector((state: RootState) => state.account.userProfile.partnerPendingUserList);
    const maxPartners = useAppSelector((state: RootState) => state.account.userProfile.maxPartners);
    const settingsRef = useAppSelector((state:RootState) => state.settings);
    const dispatch = useAppDispatch();

    const [newPartner, setNewPartner] = useState<PartnerListItem>({
        status: PartnerStatusEnum.FAILED,
        userID: -1,
        firstName: "",
        displayName: ""
    } as PartnerListItem);

    const [requestNewPartnerModalVisible, setRequestNewPartnerModalVisible] = useState(false);
    const [prayerContractModalVisible, setPrayerContractModalVisible] = useState(false);

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
        }
    }

    const acceptPartnershipRequest = (partner:PartnerListItem) => {
        axios.post(`${DOMAIN}/api/partner-pending/`+ partner.userID + '/accept', {}, RequestAccountHeader).then((response:AxiosResponse) => {

            const responsePartnerListItem:PartnerListItem = response.data as PartnerListItem;
            const newPartner:PartnerListItem = {
                ...partner,
                status: responsePartnerListItem.status
            }

            dispatch(removePartnerPendingUser(partner.userID));

            if (newPartner.status == PartnerStatusEnum.PENDING_CONTRACT_PARTNER) dispatch(addPartnerPendingPartner(partner));
            else if (newPartner.status == PartnerStatusEnum.PARTNER) dispatch(addPartner(partner));
            else console.warn("unexpected new partner state");

            const newStorageState = {...settingsRef, lastNewPartnerRequest: Date.now()}

            dispatch(setSettings(newStorageState));

        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const declinePartnershipRequest = (partner:PartnerListItem) => {
        axios.delete(`${DOMAIN}/api/partner-pending/`+ partner.userID + '/decline', RequestAccountHeader).then((response:AxiosResponse) => {
            (partner.status == PartnerStatusEnum.PENDING_CONTRACT_PARTNER) ? dispatch(removePartnerPendingPartner(partner.userID)) : dispatch(removePartnerPendingUser(partner.userID));
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const leavePartnership = (id: number, partner:DisplayItemType) => {
        axios.delete(`${DOMAIN}/api/partner/` + id + '/leave', RequestAccountHeader).then((response:AxiosResponse) => {
            dispatch(removePartner(id));
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const GET_PendingPartners = () => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/partner-pending-list', RequestAccountHeader).then((response:AxiosResponse) => {
            const pendingUsers:PartnerListItem[] = [];
            const pendingPartners:PartnerListItem[] = [];
            const newPendingPartners:PartnerListItem[] = response.data;
            newPendingPartners.forEach((partner:PartnerListItem) => (partner.status == PartnerStatusEnum.PENDING_CONTRACT_BOTH || partner.status == PartnerStatusEnum.PENDING_CONTRACT_USER) ? pendingUsers.push(partner) : pendingPartners.push(partner));
            dispatch(setPartnerPendingUsers(pendingUsers));
            dispatch(setPartnerPendingPartners(pendingPartners))
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const GET_PrayerPartners = () => {
        axios.get(`${DOMAIN}/api/user/`+ userID + '/partner-list?status=PARTNER', RequestAccountHeader).then((response:AxiosResponse) => {
            const prayerPartners:PartnerListItem[] = response.data;
            dispatch(setPartners(prayerPartners))
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const requestNewPartner = async () => {
        if (!(maxPartners > ((userProfilePartners || []).length + (userProfilePendingPartners || []).length + (userProfilePendingUsers || []).length))) {
            ToastQueueManager.show({message: "Max Partners Reached"});
            return;
        }

        if (settingsRef.lastNewPartnerRequest !== undefined && (Date.now() - parseInt(NEW_PARTNER_REQUEST_TIMEOUT ?? '3600000')) < settingsRef.lastNewPartnerRequest) {
            let timeoutEnd = Math.ceil(((settingsRef.lastNewPartnerRequest + parseInt(NEW_PARTNER_REQUEST_TIMEOUT ?? '3600000')) - Date.now()) / 3600000); // round up to the nearest hour
            ToastQueueManager.show({message: `New partner available again in ${timeoutEnd} hours`});
            return;
        }
        setRequestNewPartnerModalVisible(true);
    }

    useEffect(() => {
        GET_PrayerPartners();
    }, [])

    useEffect(() => {
        GET_PendingPartners();
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <SearchList
                key='partner-main-page'
                name='partner-main-page'
                footerItems={[<Filler />]}
                headerItems={[<Filler fillerStyle={Platform.OS === 'android' ? styles.fillerHeightAndroid : styles.fillerHeightIos}/>]}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Partners', searchType: SearchType.NONE }),
                            (userProfilePartners || []).map((partnerItem) => new SearchListValue({displayType: ListItemTypesEnum.PARTNER, displayItem: partnerItem, onPrimaryButtonCallback: leavePartnership }))
                        ],
                        [
                            new SearchListKey({displayTitle:'Pending Acceptance', searchType: SearchType.NONE }),
                            (userProfilePendingUsers || []).map((partnerItem) => new SearchListValue({displayType: ListItemTypesEnum.PENDING_PARTNER, displayItem: partnerItem, primaryButtonText: 'View Contract', onPrimaryButtonCallback: ((id, partnerItem) => { setNewPartner(partnerItem as PartnerListItem); setPrayerContractModalVisible(true)}) }))
                        ],
                        [
                            new SearchListKey({displayTitle:'Pending Partners', searchType: SearchType.NONE }),
                            (userProfilePendingPartners || []).map((partnerItem) => new SearchListValue({displayType: ListItemTypesEnum.PENDING_PARTNER, displayItem: partnerItem,  primaryButtonText: 'Decline', onPrimaryButtonCallback: ((id, partnerItem) => declinePartnershipRequest(partnerItem as PartnerListItem)) }))
                        ],
                    ])}
            />
        
            <View style={styles.bottomView}> 
                
                <Outline_Button 
                    text='New Partner'
                    onPress={() => requestNewPartner()} 
                />   
                    
                {
                    (props.continueNavigation !== undefined) &&                     
                    <Raised_Button buttonStyle={{marginVertical: 15}}
                        text={props.continueNavigation && props.continueNavigation ? "Next" : "Done"}
                        onPress={() => props.callback && props.callback(CALLBACK_STATE.SUCCESS)} 
                    />
                }

            </View>   
            <Modal 
                visible={requestNewPartnerModalVisible}
                onRequestClose={() => setRequestNewPartnerModalVisible(false)}
                animationType='slide'
                transparent={true}
            >
                <NewPartner callback={() => setRequestNewPartnerModalVisible(false)} />
            </Modal>
            <PartnershipContractModal
                visible={prayerContractModalVisible}
                partner={newPartner}
                acceptPartnershipRequest={() => {acceptPartnershipRequest(newPartner); setPrayerContractModalVisible(false)}}
                declinePartnershipRequest={() => {declinePartnershipRequest(newPartner); setPrayerContractModalVisible(false)}}
                onClose={() => setPrayerContractModalVisible(false)}
            />

            <BackButton callback={() => props.callback && props.callback(CALLBACK_STATE.BACK)} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
            <Toast />
        </SafeAreaView>  
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
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
  fillerHeightAndroid: {
    height: 35
  },
  fillerHeightIos: {
    height: 15
  }
})

export default Partnerships;