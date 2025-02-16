import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { PartnerListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/profile-types";
import { useAppDispatch, useAppSelector } from "../TypesAndInterfaces/hooks";
import { addPartnerPendingPartner, RootState, setLastNewPartnerRequest, setSettings } from "../redux-store";
import { PartnerStatusEnum } from "../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import axios, { AxiosError, AxiosResponse } from "axios";
import { DOMAIN } from "@env";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";
import { PartnershipContractModal } from "../4-Partners/partnership-widgets";
import WalkLevelQuiz from "../Widgets/WalkLevelQuiz/WalkLevelQuiz";

const NewPartner = (props:{callback?:((val:number) => void), continueNavigation?:boolean}):JSX.Element => {

    const dispatch = useAppDispatch();
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);

    const [requestNewPartnerModalVisible, setRequestNewPartnerModalVisible] = useState(false);

    const [newPartner, setNewPartner] = useState<PartnerListItem>({
        status: PartnerStatusEnum.FAILED,
        userID: -1,
        firstName: "E",
        displayName: "E"
    });

    const RequestAccountHeader = {
        headers: {
          "jwt": jwt,
        }
    }

    const POST_NewPartner = (callbackState:number, toastCallback?:((value:any) => void)) => {
        if (callbackState < 0 && props.callback !== undefined) {props.callback(-1); return} 
        
        axios.post(`${DOMAIN}/api/user/` + userID + '/new-partner', {}, RequestAccountHeader).then((response:AxiosResponse<PartnerListItem>) => {
            setNewPartner(response.data);
            setRequestNewPartnerModalVisible(true);
        }).catch((error:AxiosError<ServerErrorResponse>) => {toastCallback !== undefined && toastCallback(true); ToastQueueManager.show({error, callback: toastCallback})});
    }

    const acceptPartnershipRequest = () => {
        axios.post(`${DOMAIN}/api/partner-pending/`+ newPartner.userID + '/accept', {}, RequestAccountHeader).then((response:AxiosResponse) => {
            dispatch(addPartnerPendingPartner(newPartner));
            dispatch(setLastNewPartnerRequest());

            setRequestNewPartnerModalVisible(false);
            props.callback !== undefined && props.callback(1);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const declinePartnershipRequest = () => {
        axios.delete(`${DOMAIN}/api/partner-pending/`+ newPartner.userID + '/decline', RequestAccountHeader).then((response:AxiosResponse) => {
            setRequestNewPartnerModalVisible(false);
            props.callback !== undefined && props.callback(1);
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    return (
        
        <SafeAreaView style={{flex: 1, height: '100%'}}>
                <WalkLevelQuiz callback={POST_NewPartner}/>
                <PartnershipContractModal
                    visible={requestNewPartnerModalVisible}
                    partner={newPartner}
                    acceptPartnershipRequest={() => acceptPartnershipRequest()}
                    declinePartnershipRequest={() => declinePartnershipRequest()}
                    onClose={() => setRequestNewPartnerModalVisible(false)}
                />
        </SafeAreaView>
    )
}

export default NewPartner