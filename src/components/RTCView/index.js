'use strict'

if (!window.navigator.userAgent) {
  window.navigator.userAgent = 'react-native';
}

const io = require('socket.io-client/socket.io')

import React from 'react'

// check imports
import { Text, TouchableHighlight, View, TextInput, ListView, Dimensions } from 'react-native'

var WebRTC = require('react-native-webrtc');
var { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia } = WebRTC;

import ViewContainer from './../ViewContainer'
import TextContainer from './../TextContainer'
import Button from './../Button'

import styles from './styles'

let globalStream = null

export default class extends React.Component {

  static propTypes = {
    socket: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
    this.state = {
      pcPeers: {},
      localStream: null,
      info: 'Initializing',
      status: 'init',
      isFront: true,
      selfViewSrc: null,
      remoteList: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: '',
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height
    }
  }

  componentDidMount() {
    if (globalStream) {
      let tracks = globalStream.getAudioTracks()
      if (tracks[0]) {
        tracks[0].enabled = true
      }
    } else {
      let that = this
      this._getLocalStream(true, function (stream) {
        globalStream = stream
        that.setState({
          localStream: stream,
          selfViewSrc: stream.toURL(),
          status: 'connect',
          info: 'Waiting For Someone'
        })
        that.props.socket.emit('join', that.props.data, function (socketIds) {
          for (const i in socketIds) {
            const socketId = socketIds[i];
            that._createPC(socketId, true);
          }
        });
      });
      this.props.socket.on('exchange', function(data) {
        that._exchange(data);
      });
      this.props.socket.on('leave', function(socketId) {
        that._leave(socketId);
      });
    }
  }

  componentWillUnmount() {
    if (globalStream) {
      let tracks = globalStream.getAudioTracks()
      if (tracks[0]) {
        tracks[0].enabled = false
      }
    }
  }

  _logError(message) {
  }

  _getStats() {
    let that = this
    const pc = this.state.pcPeers[Object.keys(this.state.pcPeers)[0]];
    if (pc.getRemoteStreams && pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
      const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
      pc.getStats(track, function(report) {
      }, that._logError);
    }
  }

  _createPC(socketId, isOffer) {
    let that = this
    const pc = new RTCPeerConnection(this.props.config);

    let newPeers = this.state.pcPeers
    newPeers[socketId] = pc;
    this.setState({ pcPeers: newPeers })

    pc.onicecandidate = function (event) {
      if (event.candidate) {
        that.props.socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
      }
    };

    function createOffer() {
      pc.createOffer(function(desc) {
        pc.setLocalDescription(desc, function () {
          that.props.socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
        }, that._logError);
      }, that._logError);
    }

    pc.onnegotiationneeded = function () {
      if (isOffer) {
        createOffer();
      }
    }

    pc.oniceconnectionstatechange = function(event) {
      if (event.target.iceConnectionState === 'completed') {
        setTimeout(() => {
          that._getStats();
        }, 1000);
      }
      if (event.target.iceConnectionState === 'connected') {
        createDataChannel();
      }
    };

    pc.onaddstream = function (event) {
      // peer joined
      const remoteList = that.state.remoteList;
      remoteList[socketId] = event.stream.toURL();
      that.setState({ remoteList: remoteList });
    };

    pc.addStream(that.state.localStream);
    function createDataChannel() {
      if (pc.textDataChannel) {
        return;
      }
      const dataChannel = pc.createDataChannel('text');

      dataChannel.onmessage = function (event) {
        that._receiveTextData({user: socketId, message: event.data});
      };

      dataChannel.onopen = function () {
        that.setState({textRoomConnected: true});
      };

      pc.textDataChannel = dataChannel;
    }
    return pc;
  }

  _getLocalStream(isFront, callback) {
    let that = this
    MediaStreamTrack.getSources(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
          videoSourceId = sourceInfo.id;
        }
      }
      if ('video' != that.props.data.type) {
        getUserMedia({
          "audio": true,
          "video": false
        }, function (stream) {
          callback(stream);
        }, that._logError);
      } else {
        getUserMedia({
          "audio": true,
          "video": {
            optional: [{sourceId: videoSourceId}]
          }
        }, function (stream) {
          callback(stream);
        }, that._logError);
      }
    });
  }

  _exchange(data) {
    let that = this
    const fromId = data.from;
    let pc;
    if (fromId in this.state.pcPeers) {
      pc = this.state.pcPeers[fromId];
    } else {
      pc = this._createPC(fromId, false);
    }
    if (data.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
        if (pc.remoteDescription.type == "offer")
          pc.createAnswer(function(desc) {
            pc.setLocalDescription(desc, function () {
              that.props.socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
            }, that._logError);
          }, that._logError);
      }, that._logError);
    } else {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  _leave(socketId) {
    // peer left
    const pc = this.state.pcPeers[socketId];
    if (pc) {
      pc.close();
      let newPeers = this.state.pcPeers
      delete newPeers[socketId];
      const remoteList = this.state.remoteList;
      delete remoteList[socketId]
      this.setState({
        pcPeers: newPeers,
        remoteList: remoteList
      });
    }
  }

  _receiveTextData(data) {
    const textRoomData = this.state.textRoomData.slice();
    textRoomData.push(data);
    this.setState({textRoomData, textRoomValue: ''});
  }

  _textRoomPress() {
    if (!this.state.textRoomValue) {
      return
    }
    const textRoomData = this.state.textRoomData.slice();
    textRoomData.push({user: 'Me', message: this.state.textRoomValue});
    for (const key in this.state.pcPeers) {
      const pc = this.state.pcPeers[key];
      pc.textDataChannel.send(this.state.textRoomValue);
    }
    this.setState({textRoomData, textRoomValue: ''});
  }

  /*
  _renderTextRoom() {
    return (
      <View style={styles.listViewContainer}>
        <ListView
          dataSource={this.ds.cloneWithRows(this.state.textRoomData)}
          renderRow={rowData => <Text>{`${rowData.user}: ${rowData.message}`}</Text>}
        />
        <TextInput
          style={{width: 200, height: 30, borderColor: 'gray', borderWidth: 1}}
          onChangeText={value => this.setState({textRoomValue: value})}
          value={this.state.textRoomValue}
        />
        <TouchableHighlight
          onPress={this._textRoomPress}>
          <Text>Send</Text>
        </TouchableHighlight>
      </View>
    );
  }
  */

  render() {
    var remote = this.state.remoteList[Object.keys(this.state.remoteList)[0]]
      if (remote) {
        if ('video' != this.props.data.type) {
          return (
            <ViewContainer style={styles.container}>
              <RTCView key='1' streamURL={this.state.selfViewSrc} style={styles.hidden}/>
              <RTCView key='2' streamURL={remote} style={styles.hidden}/>
            </ViewContainer>
          )
        } else {
          return (
            <ViewContainer style={styles.container}>
              <RTCView key='1' streamURL={this.state.selfViewSrc} style={styles.hidden}/>
              <RTCView key='2' streamURL={remote}
                       style={[styles.remoteView, {width: (this.state.windowHeight/2), height: (this.state.windowHeight - 50)}]}/>
            </ViewContainer>
          )
        }
      } else {
        if ('video' != this.props.data.type) {
          return (
            <ViewContainer style={styles.container}>
              <RTCView key='1' streamURL={this.state.selfViewSrc} style={styles.hidden}/>
            </ViewContainer>
          )
        } else {
          return (
            <ViewContainer style={styles.container}>
              <RTCView key='1' streamURL={this.state.selfViewSrc}
                       style={[styles.selfView, {width: (this.state.windowHeight/2), height: (this.state.windowHeight - 50)}]}/>
            </ViewContainer>
          )
        }
      }
  }
}
