import React, {useState, useEffect, useContext, useRef} from 'react';
import { TabNavigationProps } from "../TypesAndInterfaces/profile-types"
import {View, Text, Image, StyleSheet, GestureResponderEvent, ScrollView } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../theme';
import theme from '../theme';

const Home = ({navigation}:TabNavigationProps):JSX.Element => {
    return (
        <View style={theme.background_view}>
            <View style={styles.headerSection}>
                <Text style={styles.circleNameText}>MN Young Life</Text>
                <View>
                    <Text style={styles.leaderNameText}>Pastor Foo Bar</Text>
                    <Text style={styles.orgName}>Citadel, Owatonna</Text>
                </View>
               
            </View>
            <View style={styles.annoucementsSection}>
                <Text style={styles.annoucementsText}>Announcements</Text>
            </View>
            <View style={styles.PRSection}>
                <Text style={styles.PRHeaderText}>Prayer Requests</Text>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    ...theme,
    container: {
        backgroundColor: COLORS.black,
        flex: 1, 
    },
    headerSection: {
        flexDirection: "row",
    },  
    circleNameText: {
        ...theme.title,
    },
    leaderNameText: {
        ...theme.sectionHeader,
        fontSize: FONT_SIZES.M
    },
    orgName: {
        ...theme.primary,
        fontSize: FONT_SIZES.S,
    },
    annoucementsText: {
        ...theme.sectionHeader,
    },
    PRHeaderText: {
        ...theme.sectionHeader
    },
    PRView: {

    },
})

export default Home;