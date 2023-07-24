import React, {useState, useEffect, useContext, useRef} from 'react';
import { TabNavigationProps } from "../TypesAndInterfaces/profile-types"
import {View, Text, Image, StyleSheet, GestureResponderEvent, ScrollView } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../theme';
import theme from '../theme';

const Home = ({navigation}:TabNavigationProps):JSX.Element => {
    return (
        <View style={theme.background_view}>
            <View style={styles.headerSection}>
                <Text style={styles.headerText}>MN Young Life</Text>
            </View>
            <View style={styles.annoucementsSection}>
                <Text style={styles.annoucementsText}>Announcements</Text>
            </View>
            <View style={styles.PRSection}>
                <Text style={styles.PRtext}>Prayer Requests</Text>
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
        
    },
    headerText: {
        ...theme.title,
    },
    annoucementsText: {
        ...theme.sectionHeader,
    },
    PRtext: {
        ...theme.sectionHeader
    }
})

export default Home;