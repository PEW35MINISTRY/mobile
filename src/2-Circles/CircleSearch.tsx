import { View, Text, StyleSheet, ScrollView } from "react-native";
import { CIRCLE_DISPLAY_ROUTE_NAME, StackNavigationProps } from "../TypesAndInterfaces/custom-types";
import { CircleTouchable, Input_Field, Raised_Button } from "../widgets";
import theme, { COLORS } from "../theme";
import React, { useState } from "react";
import { CircleListItem } from "../TypesAndInterfaces/config-sync/api-type-sync/circle-types";
import { DOMAIN } from "@env";
import axios from "axios";
import { useAppSelector } from "../TypesAndInterfaces/hooks";
import { RootState } from "../redux-store";

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
    const [circleModals, setCircleModals] = useState([] as CircleListItem[])

    const renderCircleModals = ():JSX.Element[] => {
        var circles:JSX.Element[] = [];
        circleModals.forEach((circleProps:CircleListItem, index) => {
            circles.push(
                <CircleTouchable
                    key={index}
                    circleProps={circleProps}
                    onPress={() => navigation.navigate(CIRCLE_DISPLAY_ROUTE_NAME, {
                        CircleProps: circleProps
                    })}
                />
            )
        })
        return circles;
    }

    // TODO: add sanatization to prevent injection
    const searchQuery = async () => {
        console.log("Circle search text: ", circleSearchText);
        await axios.get(`${DOMAIN}/api/circle-list?search=` + circleSearchText + "&filter=ALL&status=NONE&ignoreCache=false", RequestAccountHeader).then(response => {
            setCircleModals(response.data as CircleListItem[])
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
        lineHeight: 25,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        //marginTop: 30,
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
})