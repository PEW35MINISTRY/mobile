import {StyleSheet} from 'react-native';

export const COLORS = {
    primary: '#B12020',
    accent: '#62D0F5',
    accentDark: '#003f89',
    grayDark: '#303030',
    grayLight: '#DCDCDC',
    black: '#000000',
    white: '#FFFFFF',
    transparentBlack: 'rgba(0, 0, 0, 0.6)',
    transparentWhite: 'rgba(255, 255, 255, 0.2)'
}

export const FONTS = {
    header: 'PlayfairDisplay',
    title: 'EBGaramond',
    text: 'Roboto'
}

export const FONT_SIZES = {
    s: 10,
    m: 13,
    l: 20,
    xl: 30
}

export const radius = 4;

//Light THEME (default)
export default StyleSheet.create({
    //Text
    header: {
        fontFamily: FONTS.header,
        color: COLORS.primary,
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
    },
    title: {
        fontFamily: FONTS.title,
        color: COLORS.primary,
        fontSize: FONT_SIZES.l,
        fontWeight: '600',
    },
    primary: {
        fontFamily: FONTS.title,
        color: COLORS.primary,
        fontSize: FONT_SIZES.m,
        fontWeight: '600',
    },
    accent: {
        fontFamily: FONTS.title,
        color: COLORS.accent,
        fontSize: FONT_SIZES.m,
        fontWeight: '400',
    },
    text: {
        fontFamily: FONTS.text,
        color: COLORS.white,
        fontSize: FONT_SIZES.m,
        fontWeight: '500',
    },
    
    //Containers
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    horizontal_row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },

    raised_button: {
        backgroundColor: COLORS.primary,
        padding: 10,
        margin: 10,
        minWidth: 150,

        fontFamily: FONTS.title,
        color: COLORS.primary,
        fontSize: FONT_SIZES.l,
        fontWeight: '600',
        textAlign: 'center',
    },

    flat_button: {
        backgroundColor: COLORS.accent,
        padding: 5,
        margin: 10,
        minWidth: 150,

        fontFamily: FONTS.title,
        color: COLORS.accent,
        fontSize: FONT_SIZES.m,
        fontWeight: '400',
        textAlign: 'center',
    },

    input: {
        padding: 5,
        margin: 10,
        backgroundColor: COLORS.transparentWhite,
        fontFamily: FONTS.text,
        color: COLORS.white,
        fontSize: FONT_SIZES.m,
        fontWeight: '500',
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderRadius: 4
    },

    background_view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.black,
        alignSelf: 'stretch',
        textAlign: 'center',
    },

    divider: {
        paddingLeft: 5,
        paddingRight: 5,
        color: COLORS.grayLight,
        fontSize: FONT_SIZES.m,
        fontWeight: '300',
    }
  });