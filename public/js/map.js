var map;
var infowindow;
var service;
var address;
var addressGeo;
var yelpData = [];

// Initializes the map.
function initMap() {
  var denver = {lat: 39.742043, lng: -104.991531};
  map = new google.maps.Map(document.getElementById('map'), {
    center: denver,
    zoom: 14
  });
	getLocation();
}

// Pulls location from local storage when called inside initMap()
function getLocation() {
	if (localStorage.hasOwnProperty('filthFinderLocation')) {
		address = localStorage.getItem('filthFinderLocation');
		geocodeAddress(address);
		yelpStuff();
	} else if (localStorage.hasOwnProperty('filthFinderCurrLoc')) {
		addressGeo = JSON.parse(localStorage.getItem('filthFinderCurrLoc'));
		console.log(addressGeo);
		map.setCenter(addressGeo);
		address = reverseGeocode(addressGeo);
		yelpStuff();
	} else {
		alert('fuck');
	}
}

// geocodeAddress() converts the address/city inputted into the form into
// geographic coordinates. If successful, it passes the new coordinate pair
// to updateMap(), which recenters the map. If it fails, an error message pops // up. This function calls the locMarkerClear function to clear markers from
// previous searches.
function geocodeAddress() {
  var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        addressGeo = results[0].geometry.location;
        map.setCenter(addressGeo);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
  });
}

function yelpStuff() {
	$.post("https://galvanize-yelp-api.herokuapp.com/search", {
		"term": "food",
		"radius_filter": 2000,
		"category_filter": 'convenience,hotdogs,donuts',
		"sort": 1, // Returns results by distance
		"location": address
	})
	.done(function (results) {
		var path = results.businesses;
		for (var i = 0; i < path.length; i++) {
			if (results.businesses[i].is_closed === false) {
				var dataItem = {};
				dataItem.name = path[i].name;
				dataItem.lat = path[i].location.coordinate.latitude;
				dataItem.lng = path[i].location.coordinate.longitude;
				dataItem.address = path[i].location.address[0] + ', ' + path[i].location.city + ', ' + path[i].location.state_code;
				dataItem.distance = Math.round(path[i].distance);
				dataItem.rating = path[i].rating;
				dataItem.reviewCt = path[i].review_count;
				dataItem.categories = [].concat.apply([], path[i].categories);
				dataItem.filthiness = filthRating(dataItem.categories, dataItem.rating);
				yelpData.push(dataItem);
				createMarker(path[i], dataItem.filthiness);
			}
		}
		yelpData = yelpData.sort(function(a, b) {
			return b.filthiness - a.filthiness;
		});
		console.log(yelpData);
		yelpData.forEach(function(data) {
			if (isNaN(data.distance)) {
				var trash = trashCanRating(data.filthiness);
				$('tbody').append('<tr><td><i class="fa fa-map-marker"></i> ' + data.name + '<br><small>' + dataItem.address + '</small>' + '</td><td>' + '</td><td>' + trash + '</td></tr>');
			} else {
				var trash = trashCanRating(data.filthiness);
				$('tbody').append('<tr><td><i class="fa fa-map-marker"></i> ' + data.name + '<br><small>' + dataItem.address + '</small>' + '</td><td>' + data.distance + '</td><td>' + trash + '</td></tr>');
			}
			});
	});
}

function filthRating(flatCat, rating) {
	var points = 0;
	if (flatCat.includes('hotdogs') || flatCat.includes('donuts') || flatCat.includes('convenience')) {
		points+= 4;
	}
	if (flatCat.includes('cupcakes') || flatCat.includes('food_court')) {
		points+= 4;
	}
	if (flatCat.includes('mexican') || flatCat.includes('burgers') || flatCat.includes('hotdog') || flatCat.includes('candy') || flatCat.includes('cheesesteaks') || flatCat.includes('chicken_wings')) {
		points++;
	}
	if (rating < 3) {
		points+= 1;
	}
	return points;
}

// Creates markers with labels on the map.
function createMarker(place, filthiness) {
  var placeLoc = {};
	placeLoc.lat = place.location.coordinate.latitude;
	placeLoc.lng = place.location.coordinate.longitude;
  var marker = new google.maps.Marker({
    map: map,
    position: placeLoc
  });
	infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent('<strong>' + place.name + '</strong><br>' + trashCanRating(filthiness));
    infowindow.open(map, this);
  });
}

// Translates numeric rating to trash can equivalent.
function trashCanRating(rating) {
  var filthiness = Math.round(rating);
  var trash;
  if (filthiness === 1) {
    trash = '<i class="fa fa-trash"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i>';
  } else if (filthiness === 2) {
    trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i>';
  } else if (filthiness === 3) {
    trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i><i class="fa fa-trash-o"></i>';
  } else if (filthiness === 4) {
    trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash-o"></i>';
  } else if (filthiness >= 5) {
    trash = '<i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i><i class="fa fa-trash"></i>';
  } else { trash = 'No Rating'; }
  return trash;
}

function reverseGeocode(geocoder, map, infowindow) {
	var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'location': addressGeo}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
				address = results[1].formatted_address;
				console.log(address);
        // map.setZoom(11);
        // var marker = new google.maps.Marker({
        //   position: latlng,
        //   map: map
        // });
        // updateMap(results[1].formatted_address);
				// infowindow.setContent(results[1].formatted_address);
        // infowindow.open(map, marker);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}
