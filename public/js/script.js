$(document).ready(function() {
var address;

  // If user manually inputs address, geocodeAddress is called to Translate it
  // into coordinate pairs.
  $('form').submit(function(event) {
    event.preventDefault();
    localStorage.clear();
    address = $('#address').val();
    localStorage.setItem('filthFinderLocation', address);
    // saveLocation(address)
    window.location = 'results.html'
  });

  // If user
  $('#currentLocation').click(function() {
    localStorage.clear();
    // findCurrentLocation() uses the browser to capture the coordinates of the
    // user's current location. It is called when the user clicks the "Use
    // current location" button. If the coordinates are successfully captured,
    // the map is updated to center around the new coordinate pair.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var addressGeo = {};
        addressGeo.lat = position.coords.latitude;
        addressGeo.lng = position.coords.longitude;
        localStorage.setItem('filthFinderCurrLoc', JSON.stringify(addressGeo))
        window.location = 'results.html'
      })
    }

  });

});
