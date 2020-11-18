/// ////////////////////////////////////////////////////
//
// File: util.js
// This function tries to get a Token for a Room
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/// //////////////////////////////////////////////////

const createToken = function (details, callback) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText);
      if (response.error) {
        $.toast({
          heading: 'Error',
          text: response.error,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'top-right',
          showHideTransition: 'slide',
        });
      } else {
        callback(response.token);
      }
    }
  };
  xhttp.open('POST', '/api/create-token/', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify(details));
};
