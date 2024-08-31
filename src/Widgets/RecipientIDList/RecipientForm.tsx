import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useAppSelector } from "../../TypesAndInterfaces/hooks";
import { RootState } from "../../redux-store";
import { ProfileListItem } from '../../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { CircleListItem } from "../../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { CircleContact } from "../../2-Circles/circle-widgets";
import { ProfileContact } from "../../1-Profile/profile-widgets";
import { Dropdown_Select, Input_Field, Raised_Button } from "../../widgets";
import { RecipientFormCircleListItem, RecipientFormProfileListItem, RecipientFormViewMode, RecipientStatusEnum } from "./recipient-types";
import theme, { COLORS } from "../../theme";
import { SelectListItem } from "react-native-dropdown-select-list";

enum RecipientFormViewType {
    CIRCLE = "Circles",
    USER = "Profiles"
}

export const RecipientForm = (props:{userRecipientList?: ProfileListItem[], circleRecipientList?: CircleListItem[], addUserRecipientIDList:number[], setAddUserRecipientIDList:React.Dispatch<React.SetStateAction<number[]>>, 
                addCircleRecipientIDList:number[], setAddCircleRecipientIDList:React.Dispatch<React.SetStateAction<number[]>>, removeUserRecipientIDList?:number[], setRemoveUserRecipientIDList?:React.Dispatch<React.SetStateAction<number[]>>,
                removeCircleRecipientIDList?:number[], setRemoveCircleRecipientIDList?:React.Dispatch<React.SetStateAction<number[]>>, callback:(() => void)}):JSX.Element => {

    const userContacts = useAppSelector((state: RootState) => state.account.userProfile.contactList);
    const userCircles =  useAppSelector((state: RootState) => state.account.userProfile.circleList);

    const [searchText, setSearchText] = useState("");
    const [doneConstructingBaseUserRecipientList, setDoneConstructingBaseUserRecipientList] = useState(false);
    const [doneConstructingBaseCircleRecipientList, setDoneConstructingBaseCircleRecipientList] = useState(false);
    const [baseUserRecipientList, setBaseUserRecipientList] = useState<RecipientFormProfileListItem[]>([]);
    const [baseCircleRecipientList, setBaseCircleRecipientList] = useState<RecipientFormCircleListItem[]>([]);
    const [userRecipientList, setUserRecipientList] = useState<RecipientFormProfileListItem[]>([]);
    const [circleRecipientList, setCircleRecipientList] = useState<RecipientFormCircleListItem[]>([]);
    const [viewMode, setViewMode] = useState<RecipientFormViewMode>((props.removeCircleRecipientIDList !== undefined && props.removeUserRecipientIDList !== undefined) ? RecipientFormViewMode.EDITING : RecipientFormViewMode.CREATING)
    const [viewType, setViewType] = useState<RecipientFormViewType>(RecipientFormViewType.USER)

    const selectListData:SelectListItem[] = [
        {key:1, value: "Profiles"},
        {key:2, value: "Circles"},
    ]

    const getUserRecipientStatus = (recipientUserID:number):RecipientStatusEnum => {
        const addStatus = props.addUserRecipientIDList.find((id:number) => id == recipientUserID);
        const removeStatus = props.removeUserRecipientIDList !== undefined ? props.removeUserRecipientIDList.find((id:number) => id == recipientUserID) : undefined

        if (addStatus !== undefined) return RecipientStatusEnum.UNCONFIRMED_ADD;
        else if (removeStatus !== undefined) return RecipientStatusEnum.UNCONFIRMED_REMOVE;
        else return RecipientStatusEnum.NOT_SELECTED;
    }

    const getCircleRecipientStatus = (recipientCircleID:number):RecipientStatusEnum => {
        const addStatus = props.addCircleRecipientIDList.find((id:number) => id == recipientCircleID);
        const removeStatus = props.removeCircleRecipientIDList !== undefined ? props.removeCircleRecipientIDList.find((id:number) => id == recipientCircleID) : undefined

        if (addStatus !== undefined) return RecipientStatusEnum.UNCONFIRMED_ADD;
        else if (removeStatus !== undefined) return RecipientStatusEnum.UNCONFIRMED_REMOVE;
        else return RecipientStatusEnum.NOT_SELECTED;
    }

    const constructUserRecipientList = () => {
        if (userContacts == undefined) return;
        else if (props.userRecipientList == undefined || props.userRecipientList.length == 0) {
            const recipientFormListItems = userContacts.map((profileItem:ProfileListItem) => {
                const recipientListItem:RecipientFormProfileListItem = {recipientStatus: getUserRecipientStatus(profileItem.userID), viewMode: viewMode, ...profileItem}
                return recipientListItem;
            });
            setBaseUserRecipientList(recipientFormListItems);
            setUserRecipientList(recipientFormListItems);
        }
        else {
            var mutContactList = userContacts.map((profileItem:ProfileListItem) => {
                const recipientListItem:RecipientFormProfileListItem = {recipientStatus: getUserRecipientStatus(profileItem.userID), viewMode: viewMode, ...profileItem}
                return recipientListItem;
            }).sort((a, b) => {
                const aIsRecipient = (props.userRecipientList || []).some((recipient) => recipient.userID === a.userID);
                const bIsRecipient = (props.userRecipientList || []).some((recipient) => recipient.userID === b.userID);
                
                return (aIsRecipient && !bIsRecipient) ? -1 : ((bIsRecipient && !aIsRecipient) ? 1 : 0);
            });

            mutContactList.forEach(item => {
                item.recipientStatus = (props.userRecipientList || []).some((recipient) => recipient.userID === item.userID) ? RecipientStatusEnum.CONFIRMED : item.recipientStatus;
            });
            setBaseUserRecipientList(mutContactList);
            setUserRecipientList(mutContactList);
        }
        setDoneConstructingBaseUserRecipientList(true);
    }

    const constructCircleRecipientList = () => {
        if (userCircles == undefined) return;
        else if (props.circleRecipientList == undefined || props.circleRecipientList.length == 0) {
            const recipientFormListItems = userCircles.map((circleItem:CircleListItem) => {
                const recipientListItem:RecipientFormCircleListItem = {recipientStatus: getCircleRecipientStatus(circleItem.circleID), viewMode: viewMode, ...circleItem}
                return recipientListItem;
            });
            setBaseCircleRecipientList(recipientFormListItems);
            setCircleRecipientList(recipientFormListItems);
        }
        else {
            var mutCircleList = userCircles.map((circleItem:CircleListItem) => {
                const recipientListItem:RecipientFormCircleListItem = {recipientStatus: getCircleRecipientStatus(circleItem.circleID), viewMode: viewMode, ...circleItem}
                return recipientListItem;
            }).sort((a, b) => {
                const aIsRecipient = (props.circleRecipientList || []).some((recipient) => recipient.circleID === a.circleID);
                const bIsRecipient = (props.circleRecipientList || []).some((recipient) => recipient.circleID === b.circleID);
                
                return (aIsRecipient && !bIsRecipient) ? -1 : ((bIsRecipient && !aIsRecipient) ? 1 : 0);
            });

            mutCircleList.forEach(item => {
                item.recipientStatus = (props.circleRecipientList || []).some((recipient) => recipient.circleID === item.circleID) ? RecipientStatusEnum.CONFIRMED : item.recipientStatus;
            });
            setBaseCircleRecipientList(mutCircleList);
            setCircleRecipientList(mutCircleList);
        }
        setDoneConstructingBaseCircleRecipientList(true);
    }

    const onSearch = () => {
        switch(viewType) {
            case RecipientFormViewType.USER:
                // TODO: search actions

                setUserRecipientList([...baseUserRecipientList])
                break;
            case RecipientFormViewType.CIRCLE:
                // TODO: search actions

                setCircleRecipientList([...baseCircleRecipientList])
                break;
        }
    }

    const renderRecipientUsersList = ():JSX.Element[] => 
        (userRecipientList).map((recipientListItem:RecipientFormProfileListItem, index:number) => 
            <ProfileContact profileRecipientData={recipientListItem} key={index} addUserRecipient={addUserRecipient} removeUserRecipient={removeUserRecipient}
                addRemoveUserRecipient={addRemoveUserRecipient} removeRemoveUserRecipient={removeRemoveUserRecipient}
            />
        )
    

    const renderRecipientCirclesList = ():JSX.Element[] => 
        (circleRecipientList).map((recipientListItem:RecipientFormCircleListItem, index:number) => 
            <CircleContact circleRecipientData={recipientListItem} key={index} addCircleRecipient={addCircleRecipient} removeCircleRecipient={removeCircleRecipient} 
                addRemoveCircleRecipient={addRemoveCircleRecipient} removeRemoveCircleRecipient={removeRemoveCircleRecipient}
            />
        )
    
    // Suppose that the user decides to tap "share" on a particular user. They then flip to circles, then flips back to users. The person they "shared" with no longer shows as shared.
    // This is because, when a user taps the share button, that person's user ID gets added/removed from a recipient list and the button state gets updated locally (at the child component level).
    // The RecipientForm is not aware of this change.
    const addUserRecipient = (userID:number) => {
        props.setAddUserRecipientIDList([...props.addUserRecipientIDList, userID]);
        setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.userID == userID ? {...recipientList, status: RecipientStatusEnum.UNCONFIRMED_ADD} : recipientList));
    }

    const removeUserRecipient = (userID:number) => {
        props.setAddUserRecipientIDList(props.addUserRecipientIDList.filter((listUserID:number) => userID !== listUserID));
        setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.userID == userID ? {...recipientList, status: RecipientStatusEnum.NOT_SELECTED} : recipientList));
    }
                
    const addCircleRecipient = (circleID:number) => {
        props.setAddCircleRecipientIDList([...props.addCircleRecipientIDList, circleID]);
        setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleID == circleID ? {...recipientList, recipientStatus: RecipientStatusEnum.UNCONFIRMED_ADD} : recipientList));
    }

    const removeCircleRecipient = (circleID:number) => {
        props.setAddCircleRecipientIDList(props.addCircleRecipientIDList.filter((listCircleID:number) => circleID !== listCircleID));
        setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleID == circleID ? {...recipientList, recipientStatus: RecipientStatusEnum.NOT_SELECTED} : recipientList));
    }

    const addRemoveUserRecipient = (userID:number) => {
        if (props.removeUserRecipientIDList !== undefined && props.setRemoveUserRecipientIDList !== undefined) {
            props.setRemoveUserRecipientIDList([...props.removeUserRecipientIDList, userID]);
            setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.userID == userID ? {...recipientList, recipientStatus: RecipientStatusEnum.UNCONFIRMED_REMOVE} : recipientList));
        } else console.warn("Calling add on undefined property");
    }

    const removeRemoveUserRecipient = (userID:number) => {
        if (props.removeUserRecipientIDList !== undefined && props.setRemoveUserRecipientIDList !== undefined) {
            props.setRemoveUserRecipientIDList(props.removeUserRecipientIDList.filter((listUserID:number) => userID !== listUserID));
            setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.userID == userID ? {...recipientList, recipientStatus: RecipientStatusEnum.NOT_SELECTED} : recipientList));
        } else console.warn("Calling remove on undefined property");
    }
                
    const addRemoveCircleRecipient = (circleID:number) => {
        if (props.removeCircleRecipientIDList !== undefined && props.setRemoveCircleRecipientIDList !== undefined) {
            props.setRemoveCircleRecipientIDList([...props.removeCircleRecipientIDList, circleID]);
            setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleID == circleID ? {...recipientList, recipientStatus: RecipientStatusEnum.UNCONFIRMED_REMOVE} : recipientList));

        } else console.warn("Calling add on undefined property");
    }

    const removeRemoveCircleRecipient = (circleID:number) => {
        if (props.removeUserRecipientIDList !== undefined && props.setRemoveUserRecipientIDList !== undefined) {
            props.setRemoveUserRecipientIDList(props.removeUserRecipientIDList.filter((listCircleID:number) => circleID !== listCircleID));
            setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleID == circleID ? {...recipientList, recipientStatus: RecipientStatusEnum.NOT_SELECTED} : recipientList));

        } else console.warn("Calling remove on undefined property");
    }

    useEffect(() => {
        constructUserRecipientList();
        constructCircleRecipientList();
    }, [])

    return (
        <SafeAreaView style={styles.backgroundContainer}>
            <View style={styles.container}>
                <Text style={styles.titleText}>Select Recipients</Text>
                <View style={styles.viewTypeView}>
                    <TouchableOpacity
                        onPress={() => {
                            if (viewType == RecipientFormViewType.CIRCLE) { 
                                setViewType(RecipientFormViewType.USER);
                            }
                        }}
                    >
                        <Text style={(viewType == RecipientFormViewType.USER && styles.viewTypeTextSelected) || styles.viewTypeTextNotSelected}>Profiles</Text>
                    </TouchableOpacity>
                    <Text style={styles.viewTypeTextSelected}>|</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (viewType == RecipientFormViewType.USER) {
                                setViewType(RecipientFormViewType.CIRCLE);
                            }
                        }}
                    >
                        <Text style={(viewType == RecipientFormViewType.CIRCLE && styles.viewTypeTextSelected) || styles.viewTypeTextNotSelected}>Circles</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={styles.recipientScrollView} >
                {
                    (doneConstructingBaseCircleRecipientList && doneConstructingBaseUserRecipientList) ? viewType == RecipientFormViewType.CIRCLE ? renderRecipientCirclesList() : renderRecipientUsersList() : <></>
                }
            </ScrollView>
            <View style={styles.container}>
                <Raised_Button 
                    buttonStyle={styles.callbackButton}
                    text="Done"
                    onPress={() => props.callback()}
                />
            </View> 
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
        //top: 5,
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