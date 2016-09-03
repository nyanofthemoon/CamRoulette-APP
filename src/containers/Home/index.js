'use strict'

import React from 'react'
import { View, Text } from 'react-native'
import { Spinner, Button, Title } from 'native-base'
import { connect } from 'react-redux'

import { facebookConnectionSuccess, facebookConnectionFailure, goToMatchFriendshipScene, goToMatchRelationshipScene } from './../../actions'

import Container from './../../components/Container'
import FacebookButton from './../../components/FacebookButton'

import renderIf from './../../helpers/renderIf'

import styles from './styles'

@connect(
  state => ({
    app : state.app,
    user: state.user
  })
)

export default class extends React.Component {
  static propTypes = {
    app : React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired
  }

  render() {
    const {app, user} = this.props
    if ('unauthenticated' === app.get('facebookStatus')) {
      return (
        <Container header={false} cover={{type: 'splash', data:{subtype: 'login', gender:user.getIn(['profile', 'gender']), orientation:user.getIn(['profile', 'orientation'])}}}>
          <Title style={[styles.title, styles.shadowed]}>Extreme Meetups</Title>
          <Title style={[styles.subtitle, styles.shadowed]}>Time is precious.</Title>
          <FacebookButton handleSuccess={facebookConnectionSuccess} handleFailure={facebookConnectionFailure} />
        </Container>
      )
    } else if ('connected' === app.get('apiStatus')) {
        return (
          <Container header={true} scene='home'>
            <Button info onPress={goToMatchRelationshipScene}>Find Relationships</Button>
            <Button info onPress={goToMatchFriendshipScene}>Find Friendships</Button>
          </Container>
        )
    } else {
      return (
        <Container header={false} cover={{type: 'splash', data:{subtype: 'login', gender:user.getIn(['profile', 'gender']), orientation:user.getIn(['profile', 'orientation'])}}}>
          <Title style={[styles.title, styles.shadowed]}>Extreme Meetups</Title>
          <Title style={[styles.subtitle, styles.shadowed]}>Are you ready?</Title>
          <Spinner style={styles.shadowed} color='white' />
        </Container>
      )
    }
  }
}