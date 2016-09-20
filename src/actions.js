'use strict'

import { Actions } from 'react-native-router-flux'
import { Geolocation } from 'react-native'
import Geocoder from 'react-native-geocoder'
const FBSDK = require('react-native-fbsdk')
const { AccessToken, GraphRequest, GraphRequestManager } = FBSDK

import * as types from './constants'
import Store      from './configureStore'
import * as Db    from './helpers/db'

import Config from './config'

import {createSocketConnection, destroySocketConnection, isSocketConnected, emitSocketUserLoginEvent, emitSocketUserQueryEvent, emitSocketContactQueryEvent, emitSocketUserLeaveEvent, emitSocketUserJoinEvent, emitSocketUpdateMatchEvent, emitSocketUpdateProfileEvent, emitSocketUpdateAvailabilityEvent, emitSocketReportEvent, emitSocketBlockEvent, emitSocketMessageEvent} from './helpers/socket'

let dispatch = Store.dispatch

Geocoder.fallbackToGoogle(Config.google.geocodingApiKey)

function _getState() {
  return Store.getState();
}

export function loadUserData() {
  if (_getState().user.getIn(['profile','gender']) === null) {
    Db.findUser(
      function (user) {
        if (user) {
          dispatch({type: types.DB_LOAD_USER, payload: { data: user } })
          Db.findContacts(
            function (contacts) {
              if (contacts) {
                dispatch({type: types.DB_LOAD_CONTACTS, payload: { data: contacts } })
              }
            }
          )
        }
      }
    )
  }
}

export function facebookConnectionSuccess() {
  dispatch({type: types.FACEBOOK_LOGIN_SUCCEEDED})
  socketConnectionRequest()
}

export function facebookConnectionFailure() {
  dispatch({type: types.FACEBOOK_LOGIN_FAILED})
  destroySocketConnection();
}

export function facebookConnectionLogout() {
  facebookConnectionFailure()
  Actions.home()
}

function socketConnectionRequest() {
  dispatch({type: types.SOCKET_CONNECTION_REQUESTED})
  let socket = createSocketConnection()
    socket.on('error', function(error) {
    dispatch({type: types.SOCKET_CONNECTION_FAILED})
    goToErrorScene('Connection error.')
  })
  socket.on('upgrade', function(data) {
    dispatch({type: types.SOCKET_CONNECTION_FAILED})
    goToErrorScene('New Version Available! Upgrade to continue.')
  })
  socket.on('maxconn', function(data) {
    dispatch({type: types.SOCKET_CONNECTION_FAILED})
    goToErrorScene('Servers are overheating! Please try again later.')
  })
  let apiErrorMessage  = _getState().app.get('errorMessage')
  if (!apiErrorMessage) {
    socket.on('connect', function () {
      dispatch({type: types.SOCKET_CONNECTION_SUCCEEDED, payload: {socket: socket}})
      socket.on('query', function (data) {
        switch (data.type) {
          case 'user':
            return queryUserReception(data)
          case 'room':
            return queryRoomReception(data)
          default:
            return queryUnknownReception(data)
        }
      })
      socket.on('notification', function (data) {
        switch (data.type) {
          case 'room':
            return roomNotificationReception(data)
          default:
            return unknownNotificationReception(data)
        }
      })
      socket.on('availability', function (data) {
        return queryAvailabilityReception(data)
      })
      socket.on('message', function (data) {
         return messageReception(data)
      })
      socket.on('disconnect', function () {
        dispatch({type: types.SOCKET_CONNECTION_FAILED})
        Actions.home()
      })
      Db.findFacebookUser(
        function(user) {
          if (!user || Math.floor((Math.random()*10)) == 5) {
            dispatch({type: types.FACEBOOK_GRAPH_DATA_REQUESTED})
            facebookGraphGetProfile()
          } else {
           loginUser(user)
          }
        },
        function() {
          dispatch({type: types.FACEBOOK_GRAPH_DATA_REQUESTED})
          facebookGraphGetProfile()
        }
      )
    })
  }
}

export function facebookGraphGetProfile() {
  AccessToken.getCurrentAccessToken().then(function(data) {
    new GraphRequestManager().addRequest(new GraphRequest(
      '/me?fields=id,email,gender,birthday,first_name,last_name,link,picture,locale,timezone',
      null,
      function(error, result) {
        if (error) {
          dispatch({type: types.FACEBOOK_GRAPH_DATA_FAILED})
        } else {
          Db.saveFacebookUser(result, function() {
            dispatch({type: types.FACEBOOK_GRAPH_DATA_SUCCEEDED, payload: result})
            loginUser(result)
          })
        }
      }
    )).start()
  })
}

function loginUser(data) {
  if (false === Config.environment.isDevelopment()) {
    navigator.geolocation.getCurrentPosition(
      function (geo) {
        var current = {
          // http://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
          lat: parseFloat(geo.coords.latitude.toFixed(1)),
          lng: parseFloat(geo.coords.longitude.toFixed(1))
        }
        if (current.lng != _getState().user.getIn(['location', 'longitude']) || current.lat != _getState().user.getIn(['location', 'latitude'])) {
          Geocoder.geocodePosition(current).then(res => {
              data.country = res[0].country
              data.city = res[0].locality
              data.latitude = current.lat
              data.longitude = current.lng
              emitSocketUserLoginEvent(data)
              return {type: types.SOCKET_LOGIN_USER_REQUESTED, payload: data}
            })
            .catch(error => {
              goToErrorScene('Unable to analyze location. The application might be run on an older device either unable or having difficulties analyzing "location" data.')
            })
        } else {
          emitSocketUserLoginEvent(data)
          return {type: types.SOCKET_LOGIN_USER_REQUESTED, payload: data}
        }
      }, function (error) {
        alert(JSON.stringify(error));
        goToErrorScene('Unable to retrieve location. Please ensure that the application on this device has permission to access "location" data.')
      }, {
        enableHighAccuracy: true
      }
    )
  } else {
    emitSocketUserLoginEvent(data)
    return {type: types.SOCKET_LOGIN_USER_REQUESTED, payload: data}
  }
}

export function queryUser() {
  emitSocketUserQueryEvent()
  return { type: types.SOCKET_QUERY_USER_REQUESTED, payload: {} }
}

export function queryContact(id) {
  emitSocketContactQueryEvent(id)
  return { type: types.SOCKET_QUERY_CONTACT_REQUESTED, payload: {} }
}

function queryUserReception(data) {
  if (true === data.self) {
    Db.saveUser(data.data, function () {
      if (_getState().app.get('apiStatus') !== 'connected') {
        dispatch({type: types.SOCKET_QUERY_USER_RECEIVED, payload: data})
        setTimeout(function() {
          // Query Contact Information
          Object.keys(data.data.contacts.relationship).forEach(function(id) {
            if (undefined === _getState().contact.getIn(['profiles', id])) {
              queryContact(id)
            }
          })
          Object.keys(data.data.contacts.friendship).forEach(function(id) {
            if (undefined === _getState().contact.getIn(['profiles', id])) {
              queryContact(id)
            }
          })
        }, 1000)
      } else {
        dispatch({type: types.SOCKET_QUERY_USER_RECEIVED, payload: data})
      }
    })
  } else {
    dispatch({type: types.SOCKET_QUERY_CONTACT_RECEIVED, payload: data})
    let contacts = _getState().contact.toJSON()
    data.data.lastUpdated = new Date().getTime()
    contacts.profiles[data.data.id] = data.data
    Db.saveContacts(contacts, function() {})
  }
}

function queryRoomReception(data) {
  dispatch({type: types.SOCKET_QUERY_ROOM_RECEIVED, payload: data})
}

function queryAvailabilityReception(data) {
  dispatch({type: types.SOCKET_CONTACT_AVAILABILITY_RECEIVED, payload: data})
}

function queryUnknownReception(data) {
  dispatch({type: types.SOCKET_QUERY_UNKNOWN_RECEIVED, payload: data})
}

export function roomNotificationReception(data) {
  dispatch({type: types.SOCKET_NOTIFICATION_ROOM_RECEIVED, payload: data.data})
}

export function unknownNotificationReception(data) {
  dispatch({type: types.SOCKET_NOTIFICATION_UNKNOWN_RECEIVED, payload: data})
}

export function updateMatch(data) {
  emitSocketUpdateMatchEvent(data)
  return { type: types.SOCKET_UPDATE_MATCH_REQUESTED }
}

export function updateProfile(data) {
  emitSocketUpdateProfileEvent({
    profile: {
      nickname   : data.nickname,
      orientation: data.orientation,
      friendship : data.friendship,
      headline   : data.headline,
      bio        : data.bio,
      education  : data.education,
      employment : data.employment,
      diet       : data.diet
    }
  })
  return { type: types.SOCKET_UPDATE_PROFILE_REQUESTED }
}

export function goToHomeScene(data) {
  dispatch({type: types.SCENE_NAVIGATION_HOME, payload: data})
  emitSocketUserLeaveEvent()
  Actions.home()
}

export function goToContactsScene(data) {
  dispatch({type: types.SCENE_NAVIGATION_CONTACTS, payload: data})
  emitSocketUserLeaveEvent()
  Actions.contacts()
}

export function goToContact(data) {
  dispatch({type: types.SCENE_NAVIGATION_CONTACT, payload: data})
  emitSocketUserLeaveEvent()
  Actions.contact()
}

export function goToProfileScene(data) {
  dispatch({type: types.SCENE_NAVIGATION_PROFILE, payload: data})
  emitSocketUserLeaveEvent()
  Actions.profile()
}

function goToMatchScene(data) {
  dispatch({type: types.SCENE_NAVIGATION_MATCH, payload: data})
  emitSocketUserLeaveEvent()
  Actions.matchs()
}

export function goToMatchRelationshipScene() {
  goToMatchScene({ type: 'relationship', stealth: 'no' })
}

export function goToStealthMatchRelationshipScene() {
  goToMatchScene({ type: 'relationship', stealth: 'yes' })
}

export function goToMatchFriendshipScene() {
  goToMatchScene({ type: 'friendship', stealth: 'no' })
}

export function goToStealthMatchFriendshipScene() {
  goToMatchScene({ type: 'friendship', stealth: 'yes' })
}

export function goToTab(id) {
  dispatch({type: types.SCENE_NAVIGATION_TAB_CHANGE, payload: id})
}

export function blockUser(id) {
  emitSocketBlockEvent(id)
}

export function reportUser(id) {
  emitSocketReportEvent(id)
}

export function messageUser(id, message) {
  dispatch({type: types.SOCKET_MESSAGE_USER_REQUESTED, payload: { id: id, message: message } })
  emitSocketMessageEvent(id, message)
  Db.saveContacts(_getState().contact.toJSON(), function() {})
}

function messageReception(data) {
  data.scene    = _getState().app.get('currentScene')    || null
  data.sceneId  = _getState().app.get('currentSceneId')  || null
  data.sceneTab = _getState().app.get('currentSceneTab') || null
  dispatch({type: types.SOCKET_MESSAGE_USER_RECEIVED, payload: data})
  Db.saveContacts(_getState().contact.toJSON(), function() {})
}

export function goToLogoutScene(data) {
  dispatch({type: types.SCENE_NAVIGATION_LOGOUT, payload: data})
  emitSocketUserLeaveEvent()
  Actions.logout()
}

export function goToErrorScene(data) {
  dispatch({type: types.SCENE_NAVIGATION_ERROR, payload: data})
  Actions.error()
}

export function handleAppStateChange(status) {
  if ('active' === status) {
    emitSocketUpdateAvailabilityEvent('online')
  } else {
    emitSocketUpdateAvailabilityEvent('offline')
  }
  dispatch({type: types.APPLICATION_STATE_CHANGED, payload: status})
}

export function handleAppMemoryWarning() {
}

export function joinMatch(data, callback) {
  dispatch({type: types.SOCKET_MATCH_JOIN_REQUESTED, payload: data})
  emitSocketUserJoinEvent(data, callback)
}

export function leaveMatch(data) {
  dispatch({type: types.SOCKET_MATCH_LEAVE_REQUESTED, payload: data})
}

export function canShowAd() {
  let roomStatus = _getState().room.get('status')
  if (roomStatus && 'waiting' !== roomStatus) {
    return false
  }
  return true
}

export function calculateUnreadMessages() {
  let total  = 0
  let counts = _getState().contact.get('count')
  if (counts) {
    counts = JSON.parse(JSON.stringify(counts))
    Object.keys(counts).forEach(function(id) {
      total = total + counts[id]
    })
  }
  return total
}