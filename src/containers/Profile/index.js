'use strict'

import React from 'react'
import { View, Text, Alert, ScrollView } from 'react-native'
import { Button } from 'native-base'
import { connect } from 'react-redux'

import Container from './../../components/Container'
import ProfileForm from './../../components/ProfileForm'

import { goToLogoutScene, updateProfile, calculateUnreadMessages } from './../../actions'

import styles from './styles'

@connect(
  state => ({
    user: state.user,
    contact: state.contact
  })
)

export default class extends React.Component {
  static propTypes = {
    user: React.PropTypes.object.isRequired,
    contact: React.PropTypes.object.isRequired
  }

  _saveProfile() {
    updateProfile(this.refs.form.getData())
    setTimeout(function() {
      Alert.alert(
        'Awesome!',
        'Your profile has been updated.'
      )
    }, 500)
  }

  render() {
    const {user} = this.props
    let footer = (
      <View style={styles.container}>
        <Button danger style={styles.logoutButton} onPress={goToLogoutScene}>Logout</Button>
        <Button success style={styles.saveButton} onPress={this._saveProfile.bind(this)}>Save</Button>
      </View>
    )
    return (
      <Container header={true} footer={footer} unread={calculateUnreadMessages()} scene='profile' headerTitle='Plush Profile'>
        <ScrollView scrollEnabled={true}>
          <ProfileForm ref='form' user={user.toJSON()}/>
        </ScrollView>
      </Container>
    )
  }
}