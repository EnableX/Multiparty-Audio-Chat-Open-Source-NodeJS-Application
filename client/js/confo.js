/// ////////////////////////////////////////////////////
//
// File: confo.js
// This is the main application file for client end point. It tries to use Enablex Web Toolkit to
// communicate with EnableX Servers
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/// //////////////////////////////////////////////////

let localStream = null;
let username = null;
let room;
const SUPPORT_URL = 'https://enablex.io';
// Player Options
const options = {
  id: 'vcx_1001',
  attachMode: '',
  player: {
    autoplay: '',
    name: '',
    nameDisplayMode: '',
    frameFitMode: 'bestFit',
    skin: 'classic',
    class: '',
    height: 'inherit',
    width: 'inherit',
    minHeight: '120px',
    minWidth: '160px',
    aspectRatio: '',
    volume: 0,
    media: '',
    loader: {
      show: false, url: '/img/loader.gif', style: 'default', class: '',
    },
    backgroundImg: '/img/player-bg.gif',
  },
  toolbar: {
    displayMode: 'auto',
    autoDisplayTimeout: 0,
    position: 'top',
    skin: 'default',
    iconset: 'default',
    class: '',
    buttons: {
      play: false,
      share: false,
      mic: false,
      resize: false,
      volume: false,
      mute: false,
      record: false,
      playtime: false,
      zoom: false,
    },
    branding: {
      display: false,
      clickthru: 'https://www.enablex.io',
      target: 'new',
      logo: '/img/enablex.png',
      title: 'EnableX',
      position: 'right',
    },
  },
};

const usersList = [];
window.onload = function () {
  // EnxRtc.Logger.setLogLevel(4);
  // URL Parsing to fetch Room Information to join
  const parseURLParams = function (url) {
    const queryStart = url.indexOf('?') + 1;
    const queryEnd = url.indexOf('#') + 1 || url.length + 1;
    const query = url.slice(queryStart, queryEnd - 1);
    const pairs = query.replace(/\+/g, ' ').split('&');
    const parms = {}; let i; let n; let v; let
      nv;

    if (query === url || query === '') return;

    for (i = 0; i < pairs.length; i++) {
      nv = pairs[i].split('=', 2);
      n = decodeURIComponent(nv[0]);
      v = decodeURIComponent(nv[1]);

      if (!parms.hasOwnProperty(n)) parms[n] = [];
      parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
  };
  const urlData = parseURLParams(window.location.href);
  const name = urlData.user_ref[0];
  // Local Stream Definition
  const config = {
    audio: true,
    video: false,
    data: true,
    videoSize: [320, 180, 640, 480],
    options,
    maxVideoLayers: 0,
    attributes: {
      name,
    },
  };

  const countStream = 0;

  const localStreamId = null;

  /*
        <div class="card" style="width: 18rem;">
            <img class="card-img-top" src="..." alt="Card image cap">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
            </div>
        */

  const setLiveStream = function (stream, remote_name, index, clientId) {
    // Listening to Text Data
    stream.addEventListener('stream-data', (e) => {
      const text = e.msg.textMessage;
      const html = $('.multi_text_container_div').html();
      $('#multi_text_container_div').html(`${html + text}<br>`);
    });

    const name = (stream.getAttributes().name !== undefined) ? stream.getAttributes().name : '';
    if (!stream.local) {
      const multi_video_div = document.querySelector('.video_container_div');

      const newStreamDiv = document.createElement('div');
      newStreamDiv.setAttribute('id', `remotStream_${index}`);
      newStreamDiv.setAttribute('class', 'live_stream_div remote card');
      var nameDiv = document.createElement('h5');
      nameDiv.setAttribute('class', 'card-title');
      nameDiv.innerHTML = remote_name;
      newStreamDiv.appendChild(nameDiv);
      multi_video_div.appendChild(newStreamDiv);
      options.player.height = 'inherit';
      options.player.width = 'inherit';
      options.player.class = 'test_class';
      stream.show(`remotStream_${index}`, options);
      // countStream++;
    } else {
      options.player.height = 'inherit';
      options.player.width = 'inherit';
      options.player.loader.class = '';
      options.player.loader.show = false;
      const controlsDiv = document.getElementById('controls-div');
      controlsDiv.style.display = 'flex';
      var nameDiv = document.createElement('h5');
      nameDiv.setAttribute('class', 'card-title');
      nameDiv.innerHTML = name;
      document.getElementById('local_video_div').appendChild(nameDiv);
      document.getElementById('local_video_div').appendChild(controlsDiv);
      stream.show('local_video_div', options);
    }
  };

  // Function: To create user-json for Token Request
  const createDataJson = function (url) {
    const urlData = parseURLParams(url);
    username = urlData.user_ref[0];
    const retData = {
      name: urlData.user_ref[0],
      role: urlData.usertype[0],
      roomId: urlData.roomId[0],
      user_ref: urlData.user_ref[0],
    };
    return retData;
  };

  // Function: Create Token
  createToken(createDataJson(window.location.href), (response) => {
    const token = response;
    let ATList = [];
    // JOin Room
    localStream = EnxRtc.joinRoom(token, config, (success, error) => {
      if (error && error != null) {
      }
      if (success && success != null) {
        room = success.room;
        updateUsersList();
        const ownId = success.publishId;
        setLiveStream(localStream);
        for (let i = 0; i < success.streams.length; i++) {
          room.subscribe(success.streams[i]);
        }

        // Active Talker list is updated
        room.addEventListener('active-talkers-updated', (event) => {
          ATList = event.message.activeList;

          document.querySelectorAll('.vcx_stream').forEach((item) => {
            item.classList.remove('border-b-active');
          });
          const video_player_len = document.querySelectorAll('.live_stream_div.remote');
          if (event.message && event.message !== null && event.message.activeList && event.message.activeList !== null) {
            if (ATList.length == video_player_len.length) {
              return;
            }
            // document.querySelector('#multi_video_container_div').innerHTML = "";
            document.querySelectorAll('.live_stream_div.remote').forEach((item, index) => {
              item.remove();
            });

            ATList.forEach((item, index) => {
              if (item && item.clientId) {
                const st = room.remoteStreams.get(item.streamId);
                const stream_id = item.streamId;
                const clientID = item.clientId;
                const { name } = item;
                setLiveStream(st, name, stream_id, clientID);
              }
            });
          }

          if (ATList !== null && ATList.length) {
            const active_talker_stream = ATList[0].streamId;

            document.getElementById(`remotStream_${active_talker_stream}`).classList.add('border-b-active');
            document.getElementById(`stream${active_talker_stream}`).classList.add('border-b-active');
            document.getElementById(`user_${ATList[0].clientId}`).classList.add('border-l-active');
          }
          console.log(`Active Talker List :- ${JSON.stringify(event)}`);
        });

        // Stream has been subscribed successfully
        room.addEventListener('stream-subscribed', (streamEvent) => {
          const stream = (streamEvent.data && streamEvent.data.stream) ? streamEvent.data.stream : streamEvent.stream;
          for (k = 0; k < ATList.length; k++) {
            if (ATList[k].streamId == stream.getID()) {
              const remote_name = ATList[k].name;
              setLiveStream(stream, remote_name, stream.getID(), ATList[k].clientID);
            }
          }
        });

        // Listening to Incoming Data
        room.addEventListener('active-talker-data-in', (data) => {
          console.log(`active-talker-data-in${data}`);
          const obj = {
            msg: data.message.message,
            timestamp: data.message.timestamp,
            username: data.message.from,
          };
          // Handle UI to display message
        });

        // Stream went out of Room
        room.addEventListener('stream-removed', (event) => {
          console.log(event);
        });

        room.addEventListener('user-connected', (data) => {
          console.log(data);
          updateUsersList();
        });

        room.addEventListener('user-disconnected', (data) => {
          console.log(data);
          updateUsersList();
        });
      }
    });
  });

  var updateUsersList = function () {
    let list = '';
    room.userList.forEach((user, clientId) => {
      if (clientId !== room.clientId) {
        list += `<li class="list-group-item" id="user_${clientId}">${user.name}</li>`;
      }
    });

    document.querySelector('#users-list-sidebar').innerHTML = list;
  };
};

function audioMute() {
  const elem = document.getElementsByClassName('icon-confo-mute')[0];
  const onImgPath = '../img/mike.png';
  const onImgName = 'mike.png';
  const offImgPath = '../img/mute-mike.png';
  const offImgName = 'mute-mike.png';
  const currentImgPath = elem.src.split('/')[elem.src.split('/').length - 1];
  if (currentImgPath === offImgName) {
    localStream.unmuteAudio((arg) => {
      elem.src = onImgPath;
      elem.title = 'mute audio';
    });
  } else if (currentImgPath === onImgName) {
    localStream.muteAudio((arg) => {
      elem.src = offImgPath;
      elem.title = 'unmute audio';
    });
  }
}
function videoMute() {
  const elem = document.getElementsByClassName('icon-confo-video-mute')[0];
  const onImgPath = '../img/video.png';
  const onImgName = 'video.png';
  const offImgPath = '../img/mute-video.png';
  const offImgName = 'mute-video.png';
  const currentImgPath = elem.src.split('/')[elem.src.split('/').length - 1];
  if (currentImgPath === offImgName) {
    localStream.unmuteVideo((res) => {
      const streamId = localStream.getID();
      const player = document.getElementById(`stream${streamId}`);
      player.srcObject = localStream.stream;
      player.play();
      elem.src = onImgPath;
      elem.title = 'mute video';
    });
  } else if (currentImgPath === onImgName) {
    localStream.muteVideo((res) => {
      elem.src = offImgPath;
      elem.title = 'unmute video';
    });
  }
}

function endCall() {
  const r = confirm('Are you really want to Quit??');
  if (r == true) {
    window.location.href = SUPPORT_URL;
  }
}
