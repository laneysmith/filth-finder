var express = require('express');
var app = express();
var Yelp = require('yelp');
var bodyParser = require('body-parser');
var cors = require("cors");
require('dotenv').config();

var yelp = new Yelp({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	token: process.env.TOKEN,
	token_secret: process.env.TOKEN_SECRET
});

app.use(express.static('./public'));
app.use(cors());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.post('/yelp/search', function(request, response) {
	yelp.search(request.body)
		.then(function(data) {
			response.json(data);
		})
		.catch(function(err) {
			response.status(500).send(err);
		});
});

app.listen(process.env.PORT || 8080, function() {
	console.log("Listening on " + process.env.PORT + "...");
});
