'use strict'

import { StyleSheet, Dimensions } from 'react-native'

export default StyleSheet.create({

  container: {
    marginRight: 5,
    marginLeft: 5,
  },

  emptyContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: Dimensions.get('window').height - 110
  },

  title: {
    fontFamily: 'IndieFlower',
    fontSize  : 28,
    lineHeight: 34
  },

  gender: {
    marginTop: 4,
    marginLeft: 5
  },

  ready: {
    alignSelf: 'center',
    height: 80,
    width: 180,
    marginTop: 50,
    shadowColor  : 'black',
    shadowOpacity: 10,
    shadowRadius : 4,
    shadowOffset : {
      height: 5,
      width: 0
    }
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },

  thumbnail: {
  },

  text: {
    fontFamily: 'IndieFlower',
    fontSize: 20,
    lineHeight: 24,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginLeft: 12
  },

  note: {
    flexDirection: 'column'
  },

  badge: {
    alignSelf: 'flex-end',
    marginRight: -8
  },

  hidden: {
    height: 0,
    width: 0,
    padding: 0
  }

})