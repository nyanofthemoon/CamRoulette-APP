'use strict'

import { StyleSheet } from 'react-native'

import { getCorrectFontSizeForResolution } from './../../helpers/font'

export default StyleSheet.create({

  card: {
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
  },

  cardItem: {
    borderBottomColor: 'transparent',
    padding: 10
  },

  picture: {
    resizeMode: 'cover',
    height:250,
    marginBottom: 15
  },

  headline: {
    fontFamily: 'IndieFlower',
    fontSize: getCorrectFontSizeForResolution(20),
    lineHeight: getCorrectFontSizeForResolution(28),
    paddingBottom: 10,
    marginTop: -25
  },

  text: {
    fontFamily: 'IndieFlower',
    fontSize: getCorrectFontSizeForResolution(18),
    lineHeight: getCorrectFontSizeForResolution(26),
    letterSpacing: 2
  },

  info: {
    marginTop: 5
  },

  bio: {
    marginTop: 15,
    flex: 1,
    flexWrap: 'wrap',
    marginBottom: 65
  },

  hidden: {
    height:0,
    width:0
  }

})

