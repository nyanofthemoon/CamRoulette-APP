'use strict'

import React from 'react'
import { View } from 'react-native'

import styles from './styles'

export default class extends React.Component {
  render() {
    return (
      <View style={styles.viewContainer}>
        {this.props.children}
      </View>
    )
  }
}