$(document).ready(function() {

	// If user manually inputs address
	$('form').submit(function(event) {
		event.preventDefault();
		localStorage.clear();
		var address = $('#address').val();
		localStorage.setItem('ffAddress', address);
		window.location = 'results.html'
	});

	// If user uses browser's current location
	$('#currentLocation').click(function() {
		localStorage.clear();
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var addressGeo = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				localStorage.setItem('ffCurrentLocation', JSON.stringify(addressGeo))
				window.location = 'results.html'
			})
		}
	});

});
