var map;
var infowindow;
var service;
var addressGeo;

function initMap() {
  var denver = {lat: 39.742043, lng: -104.991531};
  map = new google.maps.Map(document.getElementById('map'), {
    center: denver,
    zoom: 15
  });
}

$(document).ready(function(){

  function updateMap(addressGeo) {
    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: addressGeo,
      openNow: true,
      zoom: 15,
      radius: 2500,
      type: ['food']
      }, callback);
  }

  function callback(results, status, pagination) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log(results)
      $('tbody').empty();
      for (var i = 0; i < results.length; i++) {
        var filthiness = numRating(results[i]);
        createMarker(results[i], filthiness);
        createList(results[i], filthiness);
        // if (pagination.hasNextPage) {
        //   var moreButton = document.getElementById('more');
        //   moreButton.disabled = false;
        //   moreButton.addEventListener('click', function() {
        //     moreButton.disabled = true;
        //     pagination.nextPage();
        //   });
        // }
      }
    }
  }

  // Calculates the numeric "filth rating" based on price level, overall rating,
  // types.
  function numRating(result) {
    var ratings = [];
    if (isNaN(result.price_level) === false) {
      ratings.push((result.price_level/4)*5);
    }
    if (isNaN(result.rating) === false) {
      ratings.push(result.rating);
    }
    var sum = 0;
    for (var i=0; i < ratings.length; i++) {
      sum += ratings[i];
    }
    var rating = Math.round(5-(sum/ratings.length));
    console.log(rating);
    return rating;
  }

  // Translates numeric rating to trash can equivalent.
  function trashCanRating(filthiness) {
    var trash;
    if (filthiness === 1) {
      trash = '<i class="fa fa-trash"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i>';
    } else if (filthiness === 2) {
      trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i>';
    } else if (filthiness === 3) {
      trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i>';
    } else if (filthiness === 4) {
      trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i>';
    } else if (filthiness === 5) {
      trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i>';
    } else { trash = 'Whoops!'; }
    return trash;
  }

  // Creates markers with labels on the map.
  function createMarker(place, filthiness) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent('<strong>' + place.name + '</strong><br>' + trashCanRating(filthiness));
      infowindow.open(map, this);
    });
  }

  // Appends each place to list with rating in trash cans.
  function createList(place, filthiness) {
    var trash = trashCanRating(filthiness);
    $('tbody').append('<tr><td><i class="fa fa-map-marker"></i> ' + place.name + '</td><td>' + '</td><td>' + trash + '</td></tr>');
  }

  $( "form" ).submit(function( event ) {
    event.preventDefault();
    geocodeAddress();
  });

  // geocodAddress() converts the address/city inputted into the form into
  // geographic coordinates. It is called upon submission of the form. If the
  // conversion is successful, the map is updated to center around the new
  // coordinate pair. If it fails, an error message pops up. This function calls
  // the locMarkerClear function to clear markers from previous searches.
  function geocodeAddress() {
    var geocoder = new google.maps.Geocoder();
      var address = document.getElementById("address").value;
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          addressGeo = results[0].geometry.location;
          map.setCenter(addressGeo);
          updateMap(addressGeo);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }

  $( "#currentLocation" ).click(function() {
    findCurrentLocation();
  });

  // findCurrentLocation() uses the browser to capture the coordinates of the
  // user's current location. It is called when the user clicks the "Use
  // current location" button. If the coordinates are successfully captured,
  // the map is updated to center around the new coordinate pair.
  function findCurrentLocation() {
    // if (!navigator.geolocation){
    //   alert(status);
    //   return;
    // }
    navigator.geolocation.getCurrentPosition(success, error);
    function success(position) {
      addressGeo = {};
      addressGeo.lat = position.coords.latitude;
      addressGeo.lng = position.coords.longitude;
      map.setCenter(addressGeo);
      updateMap(addressGeo);
    }
    function error() {
      alert(status);
    }
  }


});
