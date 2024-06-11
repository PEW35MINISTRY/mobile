import { StyleSheet } from 'react-native';

export enum COLORS {
    primary = '#B12020',
    accent = '#62D0F5',
    accentDark = '#003f89',
    grayDark = '#303030',
    grayLight = '#DCDCDC',
    black = '#000000',
    white = '#FFFFFF',
    transparent = 'rgba(0, 0, 0, 1.0)',
    transparentBlack = 'rgba(0, 0, 0, 0.6)',
    transparentWhite = 'rgba(255, 255, 255, 0.2)',
};

export enum FONTS {
    header = 'PlayfairDisplay',
    title = 'EBGaramond',
    text = 'Roboto'
}

export enum FONT_SIZES {
    S = 10,
    M = 13,
    L = 20,
    XL = 40
}

export const RADIUS = 6;

//Light THEME (default)
export default StyleSheet.create({
    //Text
    header: {
        fontFamily: FONTS.header,
        color: COLORS.primary,
        fontSize: FONT_SIZES.XL,
        fontWeight: '800',
    },
    title: {
        fontFamily: FONTS.title,
        color: COLORS.white,
        fontSize: FONT_SIZES.L,
        fontWeight: '700',
    },
    primary: {
        fontFamily: FONTS.title,
        color: COLORS.accent,
        fontSize: FONT_SIZES.M,
        fontWeight: '600',
    },
    accent: {
        fontFamily: FONTS.title,
        color: COLORS.accent,
        fontSize: FONT_SIZES.M,
        fontWeight: '400',
    },
    text: {
        fontFamily: FONTS.text,
        color: COLORS.white,
        fontSize: FONT_SIZES.M,
        fontWeight: '500',
    },
    detailText: {
        fontFamily: FONTS.text,
        color: COLORS.grayLight,
        fontSize: FONT_SIZES.S,
        fontWeight: '300',
    },
    
    //Containers
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '50%',
        marginTop: 'auto'
    },

    horizontal_row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },

    background_view: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: COLORS.black,
        alignSelf: 'stretch',
        textAlign: 'center',
    },

    vertical_divider: {
        marginHorizontal: 10,
        height: '50%',
        width: 2,
        backgroundColor: COLORS.transparentWhite,
    }
  });