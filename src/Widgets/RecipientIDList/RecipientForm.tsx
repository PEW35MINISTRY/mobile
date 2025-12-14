import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { useAppSelector } from "../../TypesAndInterfaces/hooks";
import { RootState } from "../../redux-store";
import { ProfileListItem } from '../../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { CircleListItem } from "../../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { BackButton, Dropdown_Select, Filler, Input_Field, Raised_Button } from "../../widgets";
import { RecipientFormCircleListItem, RecipientFormProfileListItem, RecipientFormViewMode, RecipientStatusContext, RecipientStatusEnum } from "./recipient-types";
import theme, { COLORS } from "../../theme";
import SearchList from "../SearchList/SearchList";
import { SearchListKey, SearchListValue } from "../SearchList/searchList-types";
import { DisplayItemType, ListItemTypesEnum, SearchType } from "../../TypesAndInterfaces/config-sync/input-config-sync/search-config";
import { CALLBACK_STATE, PrayerRequestFormContext } from "../../TypesAndInterfaces/custom-types";
import ToastQueueManager from "../../utilities/ToastQueueManager";
import Toast from "react-native-toast-message";

export const RecipientForm = (props:{callback: (state:CALLBACK_STATE) => void, continueNavigation:boolean, context:PrayerRequestFormContext, setContext:React.Dispatch<PrayerRequestFormContext>}) => {

    const userContacts = useAppSelector((state: RootState) => state.account.userProfile.contactList);
    const userCircles =  useAppSelector((state: RootState) => state.account.userProfile.circleList);

    const [userRecipientList, setUserRecipientList] = useState<RecipientFormProfileListItem[]>([]);
    const [circleRecipientList, setCircleRecipientList] = useState<RecipientFormCircleListItem[]>([]);
    const [mutatedUserRecipients, setMutatedUserRecipients] = useState<Map<number, RecipientStatusEnum>>(new Map());
    const [mutatedCircleRecipients, setMutatedCircleRecipients] = useState<Map<number, RecipientStatusEnum>>(new Map());
    const [viewMode, setViewMode] = useState<RecipientFormViewMode>((props.context.removeCircleRecipientIDList !== undefined && props.context.removeUserRecipientIDList !== undefined ) ? RecipientFormViewMode.EDITING : RecipientFormViewMode.CREATING)
    const [showToastRef, setShowToastRef] = useState(false);
    


    const onActionButtonPress = (callbackState:CALLBACK_STATE) => {
        let { 
            addUserRecipientIDList,  
            addCircleRecipientIDList,
            removeUserRecipientIDList, 
            removeCircleRecipientIDList 
        } = props.context

        userRecipientList.forEach((recipient) => {
            const mutatedUser = mutatedUserRecipients?.get(recipient.userID)
     
            if (mutatedUser) {
                if (mutatedUser === RecipientStatusEnum.UNCONFIRMED_ADD) {
                    addUserRecipientIDList.push(recipient.userID)
                } else if (mutatedUser === RecipientStatusEnum.NOT_SELECTED) {
                    addUserRecipientIDList = addUserRecipientIDList.filter((id) => id !== recipient.userID)
                } else if (mutatedUser === RecipientStatusEnum.CONFIRMED) {
                    removeUserRecipientIDList = (removeUserRecipientIDList || []).filter((id) => id !== recipient.userID)
                } else if (mutatedUser === RecipientStatusEnum.UNCONFIRMED_REMOVE ) {
                    removeUserRecipientIDList?.push(recipient.userID)
                }
            }
        })

        circleRecipientList.forEach((circle) => {
            const mutatedCircle = mutatedCircleRecipients?.get(circle.circleID)

            if (mutatedCircle) {
                if (mutatedCircle === RecipientStatusEnum.UNCONFIRMED_ADD) {
                    addCircleRecipientIDList.push(circle.circleID)
                } else if (mutatedCircle === RecipientStatusEnum.NOT_SELECTED) {
                    addCircleRecipientIDList = addCircleRecipientIDList.filter((id) => id !== circle.circleID)
                } else if (mutatedCircle === RecipientStatusEnum.CONFIRMED) {
                    removeCircleRecipientIDList = (removeCircleRecipientIDList || []).filter((id) => circle.circleID)
                } else if (mutatedCircle === RecipientStatusEnum.UNCONFIRMED_REMOVE) {
                    removeCircleRecipientIDList?.push(circle.circleID)
                }
            }
        })

        if (viewMode === RecipientFormViewMode.CREATING) {
            if (addCircleRecipientIDList.length === 0 && addUserRecipientIDList.length === 0 && callbackState === CALLBACK_STATE.SUCCESS) {
                ToastQueueManager.show({message: "Please select at least 1 recipient"})
                return
            }
            props.setContext({
                ...props.context,
                addUserRecipientIDList: addUserRecipientIDList,
                addCircleRecipientIDList: addCircleRecipientIDList,
            })

        } else if (viewMode === RecipientFormViewMode.EDITING) {
            props.setContext( {  
                ...props.context,           
                addUserRecipientIDList: addUserRecipientIDList,
                addCircleRecipientIDList: addCircleRecipientIDList,
                removeUserRecipientIDList: removeUserRecipientIDList,
                removeCircleRecipientIDList: removeCircleRecipientIDList
            })
        }
        setShowToastRef(false);

        props.callback(callbackState)
    }
    
    const getRecipientStatusFromSelection = (currentStatus:RecipientStatusEnum, selectionStatus?:RecipientStatusEnum):RecipientStatusEnum | undefined => {
        if (currentStatus === RecipientStatusEnum.NOT_SELECTED && selectionStatus === RecipientStatusEnum.SELECTED) {
            return RecipientStatusEnum.UNCONFIRMED_ADD
        } else if (currentStatus === RecipientStatusEnum.UNCONFIRMED_ADD && selectionStatus === RecipientStatusEnum.NOT_SELECTED) {
            return RecipientStatusEnum.NOT_SELECTED
        } else if (currentStatus === RecipientStatusEnum.UNCONFIRMED_REMOVE && selectionStatus === RecipientStatusEnum.SELECTED) {
            return RecipientStatusEnum.CONFIRMED
        } else if (currentStatus === RecipientStatusEnum.CONFIRMED && selectionStatus === RecipientStatusEnum.NOT_SELECTED) {
            return RecipientStatusEnum.UNCONFIRMED_REMOVE
        } else return undefined
    }

    // because the keys for the object are values, not property names, use a map
    const updateUserRecipientStatus = (id: number, item:DisplayItemType) => {
        const newState = new Map(mutatedUserRecipients);

        const listItem = (item as RecipientFormProfileListItem);
        const newStatus = getRecipientStatusFromSelection(listItem.recipientStatus, listItem.selectionStatus)

        if (newStatus) {
            newState.set(id, newStatus);
            setMutatedUserRecipients(newState);

            const listItemIndex = userRecipientList.findIndex((recipient) => recipient.userID === listItem.userID)
            const newRecipientList = [...userRecipientList];
            newRecipientList[listItemIndex] = {...listItem, recipientStatus: newStatus}

            setUserRecipientList(newRecipientList);
        } else console.warn("Setting new User recipientStatus with undefined selectionStatus")
       
    }

    const updateCircleRecipientStatus = (id: number, item:DisplayItemType) => {
        const newState = new Map(mutatedCircleRecipients);

        const listItem = (item as RecipientFormCircleListItem);
        const newStatus = getRecipientStatusFromSelection(listItem.recipientStatus, listItem.selectionStatus)

        if (newStatus) {
            newState.set(id, newStatus);
            setMutatedCircleRecipients(newState);

            const listItemIndex = circleRecipientList.findIndex((recipient) => recipient.circleID === listItem.circleID)
            const newRecipientList = [...circleRecipientList];
            newRecipientList[listItemIndex] = {...listItem, recipientStatus: newStatus}

            setCircleRecipientList(newRecipientList);
        } else console.warn("Setting new Circle recipientStatus with undefined selectionStatus")
      
    }

    const getUserRecipientStatus = (recipientUserID:number):RecipientStatusEnum => {

        const addStatus = props.context.addUserRecipientIDList.some((id:number) => id == recipientUserID);
        const removeStatus = props.context.removeUserRecipientIDList !== undefined ? props.context.removeUserRecipientIDList.some((id:number) => id == recipientUserID) : undefined
        const confirmedStatus = props.context.userRecipientList !== undefined ? props.context.userRecipientList.some((item) => item.userID === recipientUserID) : undefined

        if (addStatus) return RecipientStatusEnum.UNCONFIRMED_ADD;
        else if (removeStatus) return RecipientStatusEnum.UNCONFIRMED_REMOVE;
        else if (confirmedStatus) return RecipientStatusEnum.CONFIRMED;
        else return RecipientStatusEnum.NOT_SELECTED;
    }

    const getCircleRecipientStatus = (recipientCircleID:number):RecipientStatusEnum => {
        const addStatus = props.context.addCircleRecipientIDList.some((id:number) => id == recipientCircleID);
        const removeStatus = props.context.removeCircleRecipientIDList !== undefined ? props.context.removeCircleRecipientIDList.some((id:number) => id == recipientCircleID) : undefined
        const confirmedStatus = props.context.circleRecipientList !== undefined ? props.context.circleRecipientList.some((item) => item.circleID === recipientCircleID) : undefined;

        if (addStatus) return RecipientStatusEnum.UNCONFIRMED_ADD;
        else if (removeStatus) return RecipientStatusEnum.UNCONFIRMED_REMOVE;
        else if (confirmedStatus) return RecipientStatusEnum.CONFIRMED;
        else return RecipientStatusEnum.NOT_SELECTED;
    }

    const constructUserRecipientList = () => {
        if (userContacts == undefined) return;
        else if (!Array.isArray(props.context.userRecipientList) || props.context.userRecipientList.length == 0) {
            const recipientFormListItems = userContacts.map((profileItem:ProfileListItem) => {
                const recipientListItem:RecipientFormProfileListItem = {recipientStatus: getUserRecipientStatus(profileItem.userID), ...profileItem}
                return recipientListItem;
            });
            setUserRecipientList(recipientFormListItems);
        }
        else {
            var mutContactList = userContacts.map((profileItem:ProfileListItem) => {
                const recipientListItem:RecipientFormProfileListItem = {recipientStatus: getUserRecipientStatus(profileItem.userID), ...profileItem}
                return recipientListItem;
            }).sort((a, b) => {
                const aIsRecipient = (props.context.userRecipientList || []).some((recipient) => recipient.userID === a.userID);
                const bIsRecipient = (props.context.userRecipientList || []).some((recipient) => recipient.userID === b.userID);
                
                return (aIsRecipient && !bIsRecipient) ? -1 : ((bIsRecipient && !aIsRecipient) ? 1 : 0);
            });
        
            setUserRecipientList(mutContactList);
        }
    }

    const constructCircleRecipientList = () => {
        if (userCircles == undefined) return;
        else if (!Array.isArray(props.context.circleRecipientList) || props.context.circleRecipientList.length == 0) {
            const recipientFormListItems = userCircles.map((circleItem:CircleListItem) => {
                const recipientListItem:RecipientFormCircleListItem = {recipientStatus: getCircleRecipientStatus(circleItem.circleID),  ...circleItem}
                return recipientListItem;
            });
            setCircleRecipientList(recipientFormListItems);
        }
        else {
            const mutCircleList = userCircles.map((circleItem:CircleListItem) => {
                const recipientListItem:RecipientFormCircleListItem = {recipientStatus: getCircleRecipientStatus(circleItem.circleID), ...circleItem}
                return recipientListItem;
            })
            .sort((a, b) => {
                const aIsRecipient = (props.context.circleRecipientList || []).some((recipient) => recipient.circleID === a.circleID);
                const bIsRecipient = (props.context.circleRecipientList || []).some((recipient) => recipient.circleID === b.circleID);
                
                return (aIsRecipient && !bIsRecipient) ? -1 : ((bIsRecipient && !aIsRecipient) ? 1 : 0);
            });

            setCircleRecipientList(mutCircleList);
        }
    }

    useEffect(() => {
        constructUserRecipientList();
        constructCircleRecipientList();
        setShowToastRef(true);
    }, [])

    return (
        <SafeAreaView style={styles.backgroundContainer}>
            <SearchList 
                key='recipient-form-page'
                name='recipient-form-page'
                defaultDisplayKey='Profiles'
                showMultiListFilter={true}
                footerItems={[<Filler />]}
                displayMap={new Map([
                        [
                            new SearchListKey({displayTitle:'Profiles', searchType: SearchType.NONE }),
                            userRecipientList.map((userRecipient) => new SearchListValue({displayType: ListItemTypesEnum.PROFILE_CONTACT, displayItem: userRecipient, onPrimaryButtonCallback: updateUserRecipientStatus }))
                        ],
                        [
                            new SearchListKey({displayTitle:'Circles', searchType: SearchType.NONE }),
                            circleRecipientList.map((circleRecipient) => new SearchListValue({displayType: ListItemTypesEnum.CIRCLE_CONTACT, displayItem: circleRecipient, onPrimaryButtonCallback: updateCircleRecipientStatus }))
                        ],
                    ])}
            />
            <View style={styles.container}>
                <Raised_Button 
                    buttonStyle={styles.callbackButton}
                    text={props.continueNavigation ? "Next" : "Done"}
                    onPress={() => onActionButtonPress(CALLBACK_STATE.SUCCESS)}
                />
            </View>             
            <BackButton callback={() => onActionButtonPress(CALLBACK_STATE.BACK)} />
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create({
    container: {    
        justifyContent: "center",
        alignItems: "center",
    },
    backgroundContainer: {
        flex: 1,
        backgroundColor: COLORS.black
    },
    recipientScrollView: {
        flex: 1
    },
    callbackButton: {
        marginVertical: 15,
    },
    dropdownText: {
        color: COLORS.white,
        textAlign: "center",
    },
    titleText: {
        ...theme.title,
        maxWidth: '80%',
        fontSize: 34,
        marginBottom: 15,
        marginTop: 15
    },
    viewTypeView: {
        flexDirection: "row",
        marginBottom: 25
    },
    viewTypeTextSelected: {
        ...theme.title,
        color: COLORS.accent,
        textAlign: "center",
        marginHorizontal: 10
    },
    viewTypeTextNotSelected: {
        ...theme.title,
        textAlign: "center",
        marginHorizontal: 10,
        color: COLORS.grayDark
    },

})