import React, {useState, useEffect, useContext, useRef} from 'react';
import { TabNavigationProps } from "../TypesAndInterfaces/profile-types"
import {View, Text, Image, StyleSheet, GestureResponderEvent, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../theme';
import theme from '../theme';
import { useAppSelector } from '../TypesAndInterfaces/hooks';
import { RootState } from '../redux-store';
import { AnnouncementBubble, EventBubble, PrayerRequestBubble } from '../widgets';
import { Icon } from '@rneui/themed';

const Circles = ({navigation}:TabNavigationProps):JSX.Element => {
    
    const [circleListModalVisible, setCircleListModalVisible] = useState(false);
    const [circleTitle, setCircleTitle] = useState("");
    const [PastorName, setPastorName] = useState("");
    const [orgName, setOrgName] = useState("");


    // placeholder variables
    var announcements:JSX.Element[] = [];
    var prayer_requests:JSX.Element[] = [];
    
    var userIsCircleMember:Boolean;

    const userCircles = useAppSelector((state: RootState) => state.account.userProfile.circleList);
    

    if (userCircles !== undefined) {
        // syntax: list of dicts containing : {circleID, image, name(of circle), user's status}
        // can use /api/circle/ID to get full curr info for circle
        userIsCircleMember = true;
    } else {
        // show list of hot circles in your area
        userIsCircleMember = false;
    }

    const _renderController = ():JSX.Element => {
        if (userIsCircleMember) {
            // return circle page

            return (
                <View style={theme.background_view}>
                    <View style={styles.headerSection}>
                        <View style={styles.headerColumn}>
                            <Text style={styles.circleNameText}>MN Young Life</Text>
                            <Text style={styles.leaderNameText}>Pastor Foo Bar</Text>
                            <Text style={styles.orgName}>Citadel, Owatonna</Text>
                        </View>
                    </View>

                    <View style={styles.announcementSection}>
                        <Text style={styles.annoucementsText}>Announcements</Text>
                    </View>
                    <View style={styles.PRSection}>
                        <Text style={styles.PRHeaderText}>Prayer Requests</Text>
        
                    </View>
                    <View style={styles.modalView}>
                        <Modal style={styles.modalStyle}
                            visible={circleListModalVisible}
                            animationType='slide'
                            onRequestClose={() => setCircleListModalVisible(!circleListModalVisible)}
                        >
        
                        </Modal>
                    </View>
                </View>
                    
            )
        }
        else {
            // return a list of local circles
            return (
                <View>

                </View>
            )
        }
    }

    return (
        <View style={theme.background_view}>
            {_renderController()}
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
        fontSize: 32,
    },
    leaderNameText: {
        ...theme.primary,
        color: COLORS.white,
        fontSize: 18,
    },
    headerColumn: {
        flexDirection: "column"
    },  
    announcementSection: {

    },
    PRSection: {

    },
    modalView: {

    },
    modalStyle: {

    },
    orgName: {
        ...theme.primary,
        fontSize: 12,
    },
    annoucementsText: {
        ...theme.primary,
        fontSize: 22,
        color: COLORS.white,
    },
    PRHeaderText: {
        ...theme.primary,
        fontSize: 22,
        color: COLORS.white,
    },
    PRView: {

    },
})

export default Circles;