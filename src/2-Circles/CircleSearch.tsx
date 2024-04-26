import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { Input_Field, Raised_Button } from "../widgets";
import theme, { COLORS } from "../theme";
import React, { useState } from "react";
import { CircleListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { DOMAIN } from "@env";
import axios from "axios";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";
import { ROUTE_NAMES } from "../TypesAndInterfaces/routes";
import { CircleTouchable } from "./circle-widgets";
import Ionicons from "react-native-vector-icons/Ionicons";

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
        }).catch(err => console.log(err))
    }

    return (
        <View style={styles.modalView}>
            <Text style={styles.modalHeaderText}>Search Circles</Text>
            <Input_Field
                value={circleSearchText}
                onChangeText={setCircleSearchText}
            />
            <Raised_Button buttonStyle={styles.statusButton}
                text={"Search"}
                onPress={searchQuery}
            />
            <ScrollView contentContainerStyle={styles.circleSelectScroller}>
                {renderCircleModals()}
            </ScrollView>
            <View style={styles.backButtonView}>
                <TouchableOpacity
                    onPress={() => navigation.pop()}
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
