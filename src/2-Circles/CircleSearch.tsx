import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, TextInput } from "react-native";
import { StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { BackButton, Input_Field, Raised_Button } from "../widgets";
import theme, { COLORS, FONT_SIZES } from "../theme";
import React, { useState } from "react";
import { CircleListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { DOMAIN } from "@env";
import axios, { AxiosError } from "axios";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { CircleTouchable } from "./circle-widgets";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ServerErrorResponse } from "../TypesAndInterfaces/config-sync/api-type-sync/utility-types";
import ToastQueueManager from "../utilities/ToastQueueManager";

export const CircleSearch = ({navigation}:StackNavigationProps):JSX.Element => {
    const userID = useAppSelector((state: RootState) => state.account.userID);
    const jwt = useAppSelector((state: RootState) => state.account.jwt);
    
    const RequestAccountHeader = {
      headers: {
        "jwt": jwt, 
        "userID": userID,
      }
    }

    const [circleSearchText, setCircleSearchText] = useState("");
    const [circleModals, setCircleModals] = useState<CircleListItem[]>([])

    const renderCircleModals = ():JSX.Element[] => 
        (circleModals || []).map((circleProps:CircleListItem, index:number) => 
            <CircleTouchable
                key={index}
                circleProps={circleProps}
                onPress={() => navigation.navigate(ROUTE_NAMES.CIRCLE_DISPLAY_ROUTE_NAME, {
                    CircleProps: circleProps
                })}
            />
        );

    // TODO: add sanatization to prevent injection
    const searchQuery = async () => {

        await axios.get(`${DOMAIN}/api/search-list/CIRCLE?search=` + circleSearchText + "&refine=ALL&ignoreCache=false", RequestAccountHeader).then(response => {
            setCircleModals(response.data)
        }).catch((error:AxiosError<ServerErrorResponse>) => ToastQueueManager.show({error}));
    }

    return (
        <SafeAreaView style={styles.modalView}>
            <Text allowFontScaling={false} style={styles.modalHeaderText}>Search Circles</Text>
            <View style={styles.containerFieldContainer}>
                <TextInput
                    value={circleSearchText}
                    onChangeText={setCircleSearchText}

                    style={styles.searchField}
                    allowFontScaling={false}
                    autoCapitalize='none'
                    returnKeyType='done'
                />
            </View>
            <Raised_Button buttonStyle={styles.statusButton}
                text={"Search"}
                onPress={searchQuery}
            />
            <ScrollView contentContainerStyle={styles.circleSelectScroller}>
                {renderCircleModals()}
            </ScrollView>
            <BackButton navigation={navigation} buttonView={ (Platform.OS === 'ios' && {top: 40}) || undefined} />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    modalView: {
        ...theme.background_view,
        flex: 1,
        justifyContent: "flex-start"
    },
    statusButton: {
        height: 50,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',

    },
    modalHeaderText: {
        ...theme.title,
        color: COLORS.white,
        fontSize: 32,
        margin: 25

    },
    circleSelectScroller: {
        height: 650
    },
    containerFieldContainer: {
        marginVertical: 5,
    },
    searchField: {
        ...theme.text,
        fontSize: FONT_SIZES.L,
        width: 275,
        margin: 5,
        paddingVertical: 5,
        paddingHorizontal: 15,
        color: COLORS.white,
        borderBottomWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: COLORS.black,
        maxHeight: 150
    }
})
