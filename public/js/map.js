var map;
var infowindow;
var service;
var data = [];
var address;
var addressGeo;
var yelpData = [];

// Pulls location from local storage when called inside initMap()
function getLocation() {
	var localData = localStorage.getItem('filthFinderLocation')
	address = localData;
}

// Initializes the map.
function initMap() {
  var denver = {lat: 39.742043, lng: -104.991531};
  map = new google.maps.Map(document.getElementById('map'), {
    center: denver,
    zoom: 14
  });
	getLocation();
	geocodeAddress();
	$.post("https://galvanize-yelp-api.herokuapp.com/search", {
		"term": "food",
		"radius_filter": 2000,
		// "limit": 20,
		// "offset": 20,
		"category_filter": 'convenience,hotdogs,donuts',
		"sort": 1, // Returns results by distance
		"location": address
	})
	.done(function (results) {
		var path = results.businesses
		console.log(results.businesses)
		for (var i = 0; i < path.length; i++) {
			if (results.businesses[i].is_closed == false) {
				var dataItem = {};
				dataItem.name = path[i].name;
				dataItem.lat = path[i].location.coordinate.latitude;
				dataItem.lng = path[i].location.coordinate.longitude;
				dataItem.address = path[i].location.address[0] + ', ' + path[i].location.city + ', ' + path[i].location.state_code
				dataItem.distance = Math.round(path[i].distance);
				dataItem.rating = path[i].rating;
				dataItem.reviewCt = path[i].review_count;
				dataItem.categories = [].concat.apply([], path[i].categories);
				dataItem.filthiness = filthRating(dataItem.categories, dataItem.rating);
				yelpData.push(dataItem);
			}
		}
		yelpData = yelpData.sort(function(a, b) {
	    return b.filthiness - a.filthiness;
	  });
		console.log(yelpData)
	  yelpData.forEach(function(data) {
	      var trash = trashCanRating(data.filthiness);
	      $('tbody').append('<tr><td><i class="fa fa-map-marker"></i> ' + data.name + '<br><small>' + dataItem.address + '</small>' + '</td><td>' + data.distance + '</td><td>' + trash + '</td></tr>');
	    });
	});
}

function filthRating(flatCat, rating) {
	var points = 0
	console.log(flatCat)
	if (flatCat.includes('hotdogs') || flatCat.includes('donuts') || flatCat.includes('convenience')) {
		points+= 4
	}
	if (flatCat.includes('cupcakes') || flatCat.includes('food_court')) {
		points+= 4
	}
	if (flatCat.includes('mexican') || flatCat.includes('burgers') || flatCat.includes('hotdog') || flatCat.includes('candy') || flatCat.includes('cheesesteaks') || flatCat.includes('chicken_wings')) {
		points++
	}
	if (rating < 3) {
		points+= 1
	}
	return points
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
        updateMap(addressGeo);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
  });
}

function updateMap(addressGeo) {
  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: addressGeo,
    openNow: true,
    zoom: 14,
    radius: 2500,
    type: ['food']
    }, callback);
}

function callback(results, status, pagination) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    // console.log(results)
    // $('tbody').empty();
    // setMapOnAll(null);
    data = [];
    for (var i = 0; i < results.length; i++) {
      var dataItem = {};
      dataItem.name = results[i].name;
      dataItem.lat = results[i].geometry.location.lat;
      dataItem.lng = results[i].geometry.location.lng;
      dataItem.vicitinty = results[i].vicinity;
      dataItem.types = results[i].types;
      dataItem.rating = results[i].rating;
      dataItem.price_level = results[i].price_level;
      dataItem.filthiness = numRating(results[i]);
      data.push(dataItem);
      var filthiness = numRating(results[i]);
      createMarker(results[i], filthiness);
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
  // data = data.sort(function(a, b) {
  //   return b.filthiness - a.filthiness;
  // });
  // // console.log(data)
  // data.forEach(function(data) {
  //     var trash = trashCanRating(data.filthiness);
  //     $('tbody').append('<tr><td><i class="fa fa-map-marker"></i> ' + data.name + '</td><td>' + '</td><td>' + trash + '</td></tr>');
  //   });
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
  var rating = 5-(sum/ratings.length);
  return rating;
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
