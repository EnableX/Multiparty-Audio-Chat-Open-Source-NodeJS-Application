/// ////////////////////////////////////////////////////
//
// File: index.js
// This is applicaiton file for login page to accept login credentials
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/// //////////////////////////////////////////////////

window.onload = function () {
  $('.login_join_div').show();
};
const username = 'demo';
const password = 'enablex';

// Verifies login credentials before moving to Conference page

document.getElementById('login_form').addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.querySelector('#nameText'); const room = document.querySelector('#roomName'); const agree = document.querySelector('[name="agree"]'); const
    errors = [];
  if (name.value.trim() === '') {
    errors.push('Enter your name.');
  }
  if (room.value.trim() === '') {
    errors.push('Enter your Room Id.');
  }

  if (!agree.checked) {
    errors.push('Accept terms of use and privacy policy.');
  }

  if (errors.length > 0) {
    const mappederrors = errors.map((item) => `${item}</br>`);
    const allerrors = mappederrors.join('').toString();
    $.toast({
      heading: 'Error',
      text: allerrors,
      showHideTransition: 'fade',
      icon: 'error',
      position: 'top-right',
      showHideTransition: 'slide',
    });

    return false;
  }

  joinRoom(document.getElementById('roomName').value, (data) => {
    if (!jQuery.isEmptyObject(data)) {
      const user_ref = document.getElementById('nameText').value;
      let usertype;
      if (document.getElementById('moderator').checked) {
        usertype = document.getElementById('moderator').value;
      }
      if (document.getElementById('participant').checked) {
        usertype = document.getElementById('participant').value;
      }

      window.location.href = `confo.html?roomId=${data.room_id}&usertype=${usertype}&user_ref=${user_ref}`;
    } else {
      alert('No room found');
    }
  });
});

const loadingElem = document.querySelector('.loading');
document.getElementById('create_room').addEventListener('click', (event) => {
  loadingElem.classList.add('yes');
  createRoom((result) => {
    document.getElementById('roomName').value = result;
    document.getElementById('create_room_div').style.display = 'none';
    document.getElementById('message').innerHTML = 'We have prefilled the form with room-id. Share it with someone you want to talk to';
  });
});

const createRoom = (callback) => {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const response = JSON.parse(this.responseText);
      if (response.error) {
        $.toast({
          heading: 'Error',
          text: response.error,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'top-right',
        });
      } else {
        callback(response.room.room_id);
        loadingElem.classList.remove('yes');
      }
    }
  };
  xhttp.open('POST', '/api/room/multi/', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
  xhttp.send();
};
