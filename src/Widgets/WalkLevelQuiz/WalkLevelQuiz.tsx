import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import InputField, { InputRangeField } from "../../TypesAndInterfaces/config-sync/input-config-sync/inputField";
import { EDIT_PROFILE_FIELDS_ADMIN, walkLevelMultiplier, walkLevelOptions } from "../../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config";
import ToastQueueManager from "../../utilities/ToastQueueManager";
import axios, { AxiosError, AxiosResponse } from "axios";
import { DOMAIN } from "@env";
import { useAppDispatch, useAppSelector } from "../../TypesAndInterfaces/hooks";
import { RootState, updateProfile, updateWalkLevel } from "../../redux-store";
import { ServerErrorResponse } from "../../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import { BackButton, Raised_Button } from "../../widgets";
import { RootSiblingParent } from 'react-native-root-siblings';
import theme, { COLORS } from "../../theme";
import { FormInput } from "../FormInput/FormInput";
import { FormSubmit } from "../FormInput/form-input-types";

const WalkLevelQuiz = (props:{callback?:((val:number) => void)}):JSX.Element => {

    const dispatch = useAppDispatch();
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const userProfile = useAppSelector((state: RootState) => state.account.userProfile);
    const [walkLevelValue, setWalkLevelValue] = useState(Math.floor(userProfile.walkLevel / 2));

    const onSaveWalkLevel = () => {
        const walkLevel = walkLevelValue * walkLevelMultiplier;
        dispatch(updateWalkLevel(walkLevel));
        
        axios.patch(`${DOMAIN}/api/user/${userID}/walk-level`, { walkLevel }, {headers: {"jwt": jwt}}).then((response:AxiosResponse) => {
            props.callback !== undefined && props.callback(1)
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    const renderWalkLevelOptions = () => {
        var elements:JSX.Element[] = [];
        walkLevelOptions.forEach((data:[string, string], index) => {
            elements.push(
                <TouchableOpacity key={index} onPress={() => setWalkLevelValue(index)}>
                    <View key={index} style={walkLevelValue === index ? styles.inlineWalkLevelSelected : styles.inlineWalkLevelNormal}>
                        <Text style={styles.optionsText}>{data[0]}</Text><Text style={styles.optionsText}>{data[1]}</Text>
                    </View>
                </TouchableOpacity>

            );
        }) 
 
        return elements;
    }

    return (
        <RootSiblingParent>
            <SafeAreaView style={styles.backgroundView}>
                <View style={styles.container}>
                    <Text style={styles.titleText}>How do you see your relationship with God?</Text>
                    {renderWalkLevelOptions()}
                </View>
                <View style={styles.bottomView}>
                        <Raised_Button 
                            text={"Find Partner"}
                            onPress={() => onSaveWalkLevel()} 
                        />
                    </View>
                <BackButton callback={() => props.callback !== undefined && props.callback(-1)} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined}/>
            </SafeAreaView>
        </RootSiblingParent>
        

    )
}

const styles = StyleSheet.create({
    backgroundView: {
        backgroundColor: COLORS.black,
        flex: 1
    },
    titleText: {
        ...theme.title,
        fontSize: 35,
        textAlign: "center",
        flexWrap: "wrap",
        maxWidth: "90%",
        marginBottom: 20,
    },
    optionsText: {
        ...theme.text,
        textAlign: "center",
        marginHorizontal: 5,
        fontSize: 26,
    },
    titleContainer: {
        alignItems: "center",
    }, 
    container: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        bottom: "10%"
    },
    inlineWalkLevelSelected: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: COLORS.accent,
        margin: 5,
        borderRadius: 5,
        padding: 6,
        minWidth: '85%'
    },
    inlineWalkLevelNormal:{
        flexDirection: "row",
        borderWidth: 1,
        margin: 5,
        borderRadius: 5,
        padding: 6,
        minWidth: '85%',
    },
    bottomView: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center"
    },

})

export default WalkLevelQuiz;