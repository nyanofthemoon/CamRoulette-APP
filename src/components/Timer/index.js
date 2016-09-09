'use strict'

import React from 'react'
import { Text, View, Vibration } from 'react-native'

import * as Animatable from 'react-native-animatable'

import styles from './styles'

export default class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      remaining: null,
      interval : null,
      vibration: 0
    }
  }

  componentDidMount() {
    let that = this
    this.setState({
      remaining: (parseInt(this.props.milliseconds) + 1),
      interval : setInterval(function() {
        that._update()
      }, 1000)
    })
  }

  componentWillUnmount() {
    this._clearInterval()
  }

  _clearInterval() {
    clearInterval(this.state.interval)
    this.setState({
      remaining: 0,
      interval : null,
      vibration: 0
    })
  }

  _update() {
    let remaining = this.state.remaining - 1000
    if (remaining > 99) {
      this.setState({
        remaining: remaining,
        vibration: (this.state.vibration + 1)
      })
    } else {
      this._clearInterval()
    }
  }

  _mmss() {
    var date = new Date(this.state.remaining)
    var s = date.getSeconds()
    return date.getMinutes() + ':' + (s < 10 ? '0' : '') + s
  }

  render() {
    let animation = null
    if (this.state.remaining < 11000) {
      animation = 'tada'
      if (true === this.props.notify && this.state.vibration < 1) {
        Vibration.vibrate()
      }
    }

    return (
      <View style={styles.container}>
        <Animatable.Text key={this.state.remaining} animation={animation} duration={1000} iterationCount={1} style={styles.timer}>
          {this._mmss()}
        </Animatable.Text>
      </View>
    )
  }
}