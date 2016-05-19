$(document).ready(function() {
var address;

  // Saves address to local storage so it can be retrieved on the results page.
  function saveLocation(address) {
    var str = address;
    localStorage.setItem('filthFinderLocation', str);
  }

  // If user manually inputs address, geocodeAddress is called to Translate it
  // into coordinate pairs.
  $( "form" ).submit(function( event ) {
    event.preventDefault();
    address = $('#address').val();
    saveLocation(address)
    window.location = "results.html"
  });

  // If user
  $( "#currentLocation" ).click(function() {
    // findCurrentLocation() uses the browser to capture the coordinates of the
    // user's current location. It is called when the user clicks the "Use
    // current location" button. If the coordinates are successfully captured,
    // the map is updated to center around the new coordinate pair.
      // if (!navigator.geolocation){
      //   alert(status);
      //   return;
      // }
      navigator.geolocation.getCurrentPosition(success, error);
      function success(position) {
        // addressGeo = {};
        addressGeo.lat = position.coords.latitude;
        addressGeo.lng = position.coords.longitude;
        // map.setCenter(addressGeo);
        // updateMap(addressGeo);
      }
      function error() {
        alert(status);
      }
  });

});
