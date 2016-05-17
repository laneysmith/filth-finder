/* Pull local Farers market data from the USDA API and display on
** Google Maps using GeoLocation or user input zip code. By Paul Dessert
** www.pauldessert.com | www.seedtip.com
*/


	//Fire up Google maps and place inside the map div
	map = new google.maps.Map(document.getElementById('map'), mapOptions);

$(function() {

		var marketId = []; //returned from the API
		var allLatlng = []; //returned from the API
		var allMarkers = []; //returned from the API
		var marketName = []; //returned from the API
		var infowindow = null;
		var pos;
		var userCords;
		var tempMarkerHolder = [];

		//Start geolocation
		if (navigator.geolocation) {
			function error(err) {
				console.warn('ERROR(' + err.code + '): ' + err.message);
			}
			function success(pos){
				userCords = pos.coords;
				//return userCords;
			}
			// Get the user's current position
			navigator.geolocation.getCurrentPosition(success, error);
			//console.log(pos.latitude + " " + pos.longitude);
			} else {
				alert('Geolocation is not supported in your browser');
			}
		//End Geo location

		//map options
		var mapOptions = {
			zoom: 12,
			center: new google.maps.LatLng(39.742043,-104.991531),
			panControl: false,
			panControlOptions: {
				position: google.maps.ControlPosition.BOTTOM_LEFT
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.RIGHT_CENTER
			},
			scaleControl: false

		};

	//Adding infowindow option
	infowindow = new google.maps.InfoWindow({
		content: "holding..."
	});


	// function initMap() {
	//   var pyrmont = {lat: -33.867, lng: 151.195};
	//   map = new google.maps.Map(document.getElementById('map'), {
	//     center: pyrmont,
	//     zoom: 15
	//   });
	//   infowindow = new google.maps.InfoWindow();
	//   var service = new google.maps.places.PlacesService(map);
	//   service.nearbySearch({
	//     location: pyrmont,
	//     radius: 500,
	//     type: ['store']
	//   }, callback);
	// }
	// function callback(results, status) {
	//   if (status === google.maps.places.PlacesServiceStatus.OK) {
	//     for (var i = 0; i < results.length; i++) {
	//       createMarker(results[i]);
	//     }
	//   }
	// }

  // geocodeAddress function converts the address/city inputted into the
  // 'Search' field into geographic coordinates. This funciton is called by the
  // 'Search' button in the DOM. If the conversion is successful,
  // the map is updated with the new coordinate pair. If the conversion fails,
  // an error pops up with the reason for the failure. This function calls the
  // locMarkerClear function (to clear markers from previous searchs) & unhides
  // the refine search bar by changing the visibility of showRefineContainer to true.
  function geocodeAddress() {
    lookupLocation = document.getElementById('lookupLocation').value;   // pulls address from search value entered
    addressGeo = '';    // clears any current geocoded value
    // uses google map geocoder to generate a latitude/longitude coordinate pair for the address
    geocoder.geocode( { 'address': lookupLocation}, function(results, status) {
    // if geocode is succssful, updates map to be centered & zoomed in on location
      if (status === google.maps.GeocoderStatus.OK) {
        addressGeo = results[0].geometry.location;
        var mapOptions = {
          center: results[0].geometry.location,
          zoom: 15
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        // self.showRefineContainer(true);      // unhides refine search bar
        // self.locMarkerClear();               // clears any current markers
      } else {
        // error message if geocoder fails
        alert('Status: ' + status);
      }
    });
  };

	//grab form data
    $('#chooseZip').submit(function() { // bind function to submit event of form

		//define and set variables
		var userZip = $("#textZip").val();
		// console.log("This-> " + userCords.latitude);

		var accessURL;

		if(userZip){
			accessURL = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + userZip;
		} else {
			accessURL = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + userCords.latitude + "&lng=" + userCords.longitude;
		}


			//Use the zip code and return all market ids in area.
			$.ajax({
				type: "GET",
				contentType: "application/json; charset=utf-8",
				url: accessURL,
				dataType: 'jsonp',
				success: function (data) {

					 $.each(data.results, function (i, val) {
						marketId.push(val.id);
						marketName.push(val.marketname);
					 });

					//console.log(marketName);

					var counter = 0;
					//Now, use the id to get detailed info
					$.each(marketId, function (k, v){
						$.ajax({
							type: "GET",
							contentType: "application/json; charset=utf-8",
							// submit a get request to the restful service mktDetail.
							url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + v,
							dataType: 'jsonp',
							success: function (data) {

							for (var key in data) {

								var results = data[key];

								//console.log(results);

								//The API returns a link to Google maps containing lat and long. This pulls it apart.
								var googleLink = results['GoogleLink'];
								var latLong = decodeURIComponent(googleLink.substring(googleLink.indexOf("=")+1, googleLink.lastIndexOf("(")));

								var split = latLong.split(',');

								//covert values to floats, to play nice with .LatLng() below.
								var latitude = parseFloat(split[0]);
								var longitude = parseFloat(split[1]);

								//set the markers.
								myLatlng = new google.maps.LatLng(latitude,longitude);

								allMarkers = new google.maps.Marker({
									position: myLatlng,
									map: map,
									title: marketName[counter],
									html:
											'<div class="markerPop">' +
											'<h1>' + marketName[counter].substring(4) + '</h1>' + //substring removes distance from title
											'<h3>' + results['Address'] + '</h3>' +
											'<p>' + results['Products'].split(';') + '</p>' +
											'<p>' + results['Schedule'] + '</p>' +
											'</div>'
								});

								//put all lat long in array
								allLatlng.push(myLatlng);

								//Put the marketrs in an array
								tempMarkerHolder.push(allMarkers);

								counter++;
								//console.log(counter);
							};

								google.maps.event.addListener(allMarkers, 'click', function () {
									infowindow.setContent(this.html);
									infowindow.open(map, this);
								});


								//console.log(allLatlng);
								//  Make an array of the LatLng's of the markers you want to show
								//  Create a new viewpoint bound
								var bounds = new google.maps.LatLngBounds ();
								//  Go through each...
								for (var i = 0, LtLgLen = allLatlng.length; i < LtLgLen; i++) {
								  //  And increase the bounds to take this point
								  bounds.extend (allLatlng[i]);
								}
								//  Fit these bounds to the map
								map.fitBounds (bounds);


							}
						});
					}); //end .each
				}
			});

        return false; // important: prevent the form from submitting
    });
});
