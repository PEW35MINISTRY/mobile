import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { useAppSelector } from "../../TypesAndInterfaces/hooks";
import { RootState } from "../../redux-store";
import { ProfileListItem } from '../../TypesAndInterfaces/config-sync/api-type-sync/profile-types';
import { CircleListItem } from "../../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { CircleContact } from "../../2-Circles/circle-widgets";
import { ProfileContact } from "../../1-Profile/profile-widgets";
import { Dropdown_Select, Input_Field, Raised_Button } from "../../widgets";
import { SelectListItem } from "../../TypesAndInterfaces/custom-types";
import { RecipientFormCircleListItem, RecipientFormProfileListItem, RecipientFormViewMode, RecipientStatusEnum } from "./recipient-types";
import theme, { COLORS } from "../../theme";

enum RecipientFormViewType {
    CIRCLE = "Circles",
    USER = "Profiles"
}

export const RecipientForm = (props:{userRecipientList?: ProfileListItem[], circleRecipientList?: CircleListItem[], addUserRecipientIDList:number[], setAddUserRecipientIDList:React.Dispatch<React.SetStateAction<number[]>>, 
                addCircleRecipientIDList:number[], setAddCircleRecipientIDList:React.Dispatch<React.SetStateAction<number[]>>, removeUserRecipientIDList?:number[], setRemoveUserRecipientIDList?:React.Dispatch<React.SetStateAction<number[]>>,
                removeCircleRecipientIDList?:number[], setRemoveCircleRecipientIDList?:React.Dispatch<React.SetStateAction<number[]>>, callback:(() => void)}):JSX.Element => {

    const userContacts = useAppSelector((state: RootState) => state.account.userProfile.contactList);
    const userCircles =  useAppSelector((state: RootState) => state.account.userProfile.circleList);

    const [displayMode, setDisplayMode] = useState<RecipientFormViewType>(RecipientFormViewType.USER);
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
                const recipientListItem:RecipientFormProfileListItem = {status: getUserRecipientStatus(profileItem.userID), viewMode: viewMode, profileListData: profileItem}
                return recipientListItem;
            });
            setBaseUserRecipientList(recipientFormListItems);
            setUserRecipientList(recipientFormListItems);
        }
        else {
            var mutContactList = userContacts.map((profileItem:ProfileListItem) => {
                const recipientListItem:RecipientFormProfileListItem = {status: getUserRecipientStatus(profileItem.userID), viewMode: viewMode, profileListData: profileItem}
                return recipientListItem;
            })
            var startIndex = 0;
            console.log(props.userRecipientList);
            // Place current recipients at the front of the list
            for(var i=0; i<mutContactList.length; i++) {
                for (var j=0; j<props.userRecipientList.length; j++) {
                    if (mutContactList[i].profileListData.userID == props.userRecipientList[j].userID) {
                        var tmp = mutContactList[startIndex];
                        mutContactList[startIndex] = mutContactList[i];
                        mutContactList[i] = tmp;
                        mutContactList[startIndex].status = RecipientStatusEnum.CONFIRMED;
                        startIndex++;
                        break;
                    }
                }
            }
            setBaseUserRecipientList(mutContactList);
            setUserRecipientList(mutContactList);
        }
        setDoneConstructingBaseUserRecipientList(true);
    }

    const constructCircleRecipientList = () => {
        if (userCircles == undefined) return;
        else if (props.circleRecipientList == undefined || props.circleRecipientList.length == 0) {
            const recipientFormListItems = userCircles.map((circleItem:CircleListItem) => {
                const recipientListItem:RecipientFormCircleListItem = {status: getCircleRecipientStatus(circleItem.circleID), viewMode: viewMode, circleListData: circleItem}
                return recipientListItem;
            });
            setBaseCircleRecipientList(recipientFormListItems);
            setCircleRecipientList(recipientFormListItems);
        }
        else {
            var mutCircleList = userCircles.map((circleItem:CircleListItem) => {
                const recipientListItem:RecipientFormCircleListItem = {status: getCircleRecipientStatus(circleItem.circleID), viewMode: viewMode, circleListData: circleItem}
                return recipientListItem;
            })
            var startIndex = 0;

             // Place current recipients at the front of the list
            for(var i=0; i<mutCircleList.length; i++) {
                for (var j=0; j<props.circleRecipientList.length; j++) {
                    if (mutCircleList[i].circleListData.circleID == props.circleRecipientList[j].circleID) {
                        var tmp = mutCircleList[startIndex];
                        mutCircleList[startIndex] = mutCircleList[i];
                        mutCircleList[i] = tmp;
                        mutCircleList[startIndex].status = RecipientStatusEnum.CONFIRMED;
                        startIndex++;
                    }
                }
            }
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
        setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.profileListData.userID == userID ? {...recipientList, status: RecipientStatusEnum.UNCONFIRMED_ADD} : recipientList));
    }

    const removeUserRecipient = (userID:number) => {
        props.setAddUserRecipientIDList(props.addUserRecipientIDList.filter((listUserID:number) => userID !== listUserID));
        setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.profileListData.userID == userID ? {...recipientList, status: RecipientStatusEnum.NOT_SELECTED} : recipientList));
    }
                
    const addCircleRecipient = (circleID:number) => {
        props.setAddCircleRecipientIDList([...props.addCircleRecipientIDList, circleID]);
        setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleListData.circleID == circleID ? {...recipientList, status: RecipientStatusEnum.UNCONFIRMED_ADD} : recipientList));
    }

    const removeCircleRecipient = (circleID:number) => {
        props.setAddCircleRecipientIDList(props.addCircleRecipientIDList.filter((listCircleID:number) => circleID !== listCircleID));
        setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleListData.circleID == circleID ? {...recipientList, status: RecipientStatusEnum.NOT_SELECTED} : recipientList));
    }

    const addRemoveUserRecipient = (userID:number) => {
        if (props.removeUserRecipientIDList !== undefined && props.setRemoveUserRecipientIDList !== undefined) {
            props.setRemoveUserRecipientIDList([...props.removeUserRecipientIDList, userID]);
            setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.profileListData.userID == userID ? {...recipientList, status: RecipientStatusEnum.UNCONFIRMED_REMOVE} : recipientList));
        } else console.warn("Calling add on undefined property");
    }

    const removeRemoveUserRecipient = (userID:number) => {
        if (props.removeUserRecipientIDList !== undefined && props.setRemoveUserRecipientIDList !== undefined) {
            props.setRemoveUserRecipientIDList(props.removeUserRecipientIDList.filter((listUserID:number) => userID !== listUserID));
            setUserRecipientList(userRecipientList.map((recipientList:RecipientFormProfileListItem) => recipientList.profileListData.userID == userID ? {...recipientList, status: RecipientStatusEnum.NOT_SELECTED} : recipientList));
        } else console.warn("Calling remove on undefined property");
    }
                
    const addRemoveCircleRecipient = (circleID:number) => {
        if (props.removeCircleRecipientIDList !== undefined && props.setRemoveCircleRecipientIDList !== undefined) {
            props.setRemoveCircleRecipientIDList([...props.removeCircleRecipientIDList, circleID]);
            setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleListData.circleID == circleID ? {...recipientList, status: RecipientStatusEnum.UNCONFIRMED_REMOVE} : recipientList));

        } else console.warn("Calling add on undefined property");
    }

    const removeRemoveCircleRecipient = (circleID:number) => {
        if (props.removeUserRecipientIDList !== undefined && props.setRemoveUserRecipientIDList !== undefined) {
            props.setRemoveUserRecipientIDList(props.removeUserRecipientIDList.filter((listCircleID:number) => circleID !== listCircleID));
            setCircleRecipientList(circleRecipientList.map((recipientList:RecipientFormCircleListItem) => recipientList.circleListData.circleID == circleID ? {...recipientList, status: RecipientStatusEnum.NOT_SELECTED} : recipientList));

        } else console.warn("Calling remove on undefined property");
    }

    useEffect(() => {
        constructUserRecipientList();
        constructCircleRecipientList();
    }, [])
    console.log(displayMode, doneConstructingBaseCircleRecipientList, doneConstructingBaseUserRecipientList);
    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.container}>
                <Text style={styles.titleText}>Select Recipients</Text>
                <Dropdown_Select 
                    data={selectListData} 
                    setSelected={(viewMode:string) => setDisplayMode(viewMode as RecipientFormViewType)}
                    boxStyle={{width: 200}}
                    defaultOption={selectListData[0]}
                />
            </View>
            <ScrollView style={styles.recipientScrollView} >
                {
                    (doneConstructingBaseCircleRecipientList && doneConstructingBaseUserRecipientList) ? displayMode == RecipientFormViewType.CIRCLE ? renderRecipientCirclesList() : renderRecipientUsersList() : <></>
                }
            </ScrollView>
            <View style={styles.container}>
                <Raised_Button 
                    buttonStyle={styles.callbackButton}
                    text="Done"
                    onPress={() => props.callback()}
                />
            </View> 
        </View>
        
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
    }

})