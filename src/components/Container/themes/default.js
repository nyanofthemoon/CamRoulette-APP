'use strict'

// http://nativebase.io/docs/v0.4.6/customize

import Color from 'color';

import {Platform} from 'react-native';

import { getCorrectFontSizeForResolution } from './../../../helpers/font'

export default {
    brandPrimary : 'transparent',
    brandInfo: '#262672',
    brandSuccess: '#006600',
    brandDanger: '#990000',
    brandWarning: '#CC3300',
    brandSidebar: '#252932',

    fontFamily: (Platform.OS === 'ios' ) ? 'Comfortaa' : 'Comfortaa',
    btnFontFamily: (Platform.OS === 'ios' ) ? 'Comfortaa' : 'Comfortaa',
    iconFamily: 'Ionicons',

    inverseTextColor: '#ffffff',
    textColor: '#ffffff',

    subtitleColor: '#ffffff',

    fontSizeBase: getCorrectFontSizeForResolution(12),
    titleFontSize: (Platform.OS === 'ios' ) ? 18 : 19,
    subTitleFontSize: (Platform.OS === 'ios' ) ? 12 : 14,

    inputFontSize: getCorrectFontSizeForResolution(15),
    inputLineHeight: getCorrectFontSizeForResolution(24),

    get fontSizeH1 () {
        return this.fontSizeBase*1.8;
    },
    get fontSizeH2 () {
        return this.fontSizeBase* 1.6;
    },
    get fontSizeH3 () {
        return this.fontSizeBase* 1.4;
    },
    get btnTextSize () {
        return (Platform.OS==='ios') ? this.fontSizeBase* 1.1 :
        this.fontSizeBase-1;
    },
    get btnTextSizeLarge () {
        return this.fontSizeBase* 1.5;
    },
    get btnTextSizeSmall () {
        return this.fontSizeBase* .8;
    },
    get iconSizeLarge () {
        return this.iconFontSize* 1.5;
    },
    get iconSizeSmall () {
        return this.iconFontSize* .6;
    },

    buttonPadding: getCorrectFontSizeForResolution(6),

    borderRadiusBase: (Platform.OS === 'ios' ) ? 5 : 2,

    get borderRadiusLarge () {
        return this.fontSizeBase* 3.8;
    },

    footerHeight: 55,
    toolbarHeight: (Platform.OS === 'ios' ) ? 75 : 75,
    toolbarDefaultBg: (Platform.OS === 'ios' ) ? '#F8F8F8' : '#039BE5',
    toolbarInverseBg: '#222',

    iosToolbarBtnColor: '#ffffff',

    toolbarTextColor: (Platform.OS==='ios') ? '#fff' : '#fff',

    checkboxBgColor: '#039BE5',
    checkboxTickColor: '#fff',

    checkboxSize: getCorrectFontSizeForResolution(23),

    radioColor: '#7e7e7e',
    get radioSelectedColor() {
        return Color(this.radioColor).darken(0.2).hexString();
    },

    radioBtnSize: (Platform.OS === 'ios') ? getCorrectFontSizeForResolution(25) : getCorrectFontSizeForResolution(23),

    tabBgColor: '#262672',
    tabFontSize: 15,
    tabTextColor: '#fff',

    btnDisabledBg: '#b5b5b5',
    btnDisabledClr: '#f1f1f1',

    cardDefaultBg: '#fff',

    get darkenHeader() {
        return Color(this.tabBgColor).darken(0.03).hexString();
    },
    get btnPrimaryBg () {
        return this.brandPrimary;
    },
    get btnPrimaryColor () {
        return this.inverseTextColor;
    },
    get btnSuccessBg () {
        return this.brandSuccess;
    },
    get btnSuccessColor () {
        return this.inverseTextColor;
    },
    get btnDangerBg () {
        return this.brandDanger;
    },
    get btnDangerColor () {
        return this.inverseTextColor;
    },
    get btnInfoBg () {
        return this.brandInfo;
    },
    get btnInfoColor () {
        return this.inverseTextColor;
    },
    get btnWarningBg () {
        return this.brandWarning;
    },
    get btnWarningColor () {
        return this.inverseTextColor;
    },

    borderWidth: 1,
    iconMargin: 7,

    get inputColor () {
        return this.textColor;
    },
    get inputColorPlaceholder () {
        return '#575757';
    },
    inputBorderColor: '#D9D5DC',
    inputSuccessBorderColor: '#2b8339',
    inputErrorBorderColor: '#ed2f2f',
    inputHeightBase: 40,
    inputGroupMarginBottom: 10,
    inputPaddingLeft: 5,
    get inputPaddingLeftIcon () {
        return this.inputPaddingLeft* 8;
    },

    btnLineHeight: getCorrectFontSizeForResolution(19),

    dropdownBg: '#000',
    dropdownLinkColor: '#414142',

    jumbotronPadding: getCorrectFontSizeForResolution(30),
    jumbotronBg: '#C9C9CE',

    contentPadding: 10,

    listBorderColor: '#DDDDDD',
    listDividerBg: '#DDDDDD',
    listItemPadding: getCorrectFontSizeForResolution(15),
    listItemHeight: getCorrectFontSizeForResolution(60),
    listNoteColor: '#AAAAAA',
    listNoteSize: getCorrectFontSizeForResolution(12),

    iconFontSize: (Platform.OS === 'ios' ) ? 30 : 28,

    badgeColor: '#FFF',
    badgeBg: '#262672',

    lineHeight: (Platform.OS === 'ios' ) ? 20 : 24,
    iconLineHeight: (Platform.OS === 'ios' ) ? 37 : 30,

    toolbarIconSize: (Platform.OS === 'ios' ) ? 20 : 22,

    toolbarInputColor: '#CECDD2',

    defaultSpinnerColor: '#45D56E',
    inverseSpinnerColor: '#1A191B',

    defaultProgressColor: '#E4202D',
    inverseProgressColor: '#1A191B'
}
