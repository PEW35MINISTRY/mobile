import React, { useEffect, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ComponentFlow from '../Widgets/ComponentFlow/ComponentFlow';
import { CALLBACK_STATE, StackNavigationProps } from '../TypesAndInterfaces/custom-types';
import { ROUTE_NAMES } from '../TypesAndInterfaces/routes';
import theme, { COLORS, FONT_SIZES, FONTS } from '../theme';
import LOGO from '../../assets/logo.png';
import { IntroductionFlowSlideTextList } from '../TypesAndInterfaces/config-sync/input-config-sync/profile-field-config';
import { PageIndicator } from 'react-native-page-indicator';
import { Flat_Button, Outline_Button, Raised_Button } from '../widgets';
import { useAppDispatch } from '../TypesAndInterfaces/hooks';
import { setReadIntroductionFlow } from '../redux-store';


const IntroductionFlow = ({navigation}:StackNavigationProps):JSX.Element => {
    const dispatch = useAppDispatch();
    const PRAYER_ICON_ACCENT = require('../../assets/prayer-icon-blue.png');
    const { width, height } = useWindowDimensions();
    const scrollX = useRef(new Animated.Value(0)).current;
    const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;

    return (
        <SafeAreaView style={styles.backgroundView}>
            <Image source={LOGO} style={styles.logo} resizeMode='contain'></Image>
             <Animated.ScrollView
                horizontal={true}
                pagingEnabled={true}
                style={{ flex: 1 }}
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
                
                })}
            >
                {IntroductionFlowSlideTextList.map((text, index) => (
                     <View key={index} style={[styles.page, { width, flex: 1 }]}>
                        { index === IntroductionFlowSlideTextList.length - 1 && <Image source={PRAYER_ICON_ACCENT} style={{ height: 100, width: 100, marginVertical: 20, alignSelf: "center"}} /> }
                        <Text style={styles.slideText}>{text}</Text>
                        <View style={{flex: 1, justifyContent: 'flex-end', bottom: 20}}>
                            <Outline_Button 
                                text='Skip'
                                onPress={() => { dispatch(setReadIntroductionFlow()); navigation.navigate(ROUTE_NAMES.LOGIN_ROUTE_NAME) }} buttonStyle={{ bottom: 1}}
                                buttonStyle={{ width: 5, alignSelf: 'center'}}
                            />
                            { index === IntroductionFlowSlideTextList.length - 1 && 
                                <Raised_Button text='Continue' onPress={() => { dispatch(setReadIntroductionFlow()); navigation.navigate(ROUTE_NAMES.LOGIN_ROUTE_NAME) }} buttonStyle={{ bottom: 1}}/>
                            }
                        </View>

                     </View>
                ))}
            </Animated.ScrollView>
            <PageIndicator variant='beads' count={4} current={animatedCurrent} color={COLORS.white} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ...theme,
    backgroundView: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
    },
    logo: {
        height: 175,
        marginBottom: 10,
    },
    page: {
        //maxHeight: '40%',
        //backgroundColor: 'blue',
        //alignItems: 'center',
        //justifyContent: 'center',
    },
    slideText: {
        fontFamily: FONTS.text,
        color: COLORS.white,
        fontSize: FONT_SIZES.L + 5,
        fontWeight: '700',
        textAlign: 'center',
    },
    horizontalNavigationContainer: {
        top: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    spacingView: {
        flexDirection: 'row',
    },
    navigationButtonTextStyle: {
        fontStyle: 'italic',
        ...theme.text,
        fontSize: FONT_SIZES.L,
        textAlign: 'center',
        alignSelf: 'center',
    }
});

export default IntroductionFlow;