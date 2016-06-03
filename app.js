var express = require('express')
var app = express()
var Yelp = require('yelp')
var bodyParser = require('body-parser')
var cors = require("cors")

var yelp = new Yelp({
  consumer_key: '-YUv5Bk_teENeyIjAOmr_g',
  consumer_secret: 'BH79wd1VO9GC5PotEuxNvTI2gkU',
  token: 'fyMjtpdtzI9KGt5Lg51vKE3ZnyJAvjbL',
  token_secret: 'fnwnTJs4AWE_szrA8YuAfAjcn-c',
})

app.use(express.static('./public'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/yelp/search', function (request, response) {
  yelp.search(request.body)
    .then(function (data) {
      response.json(data)
    })
    .catch(function (err) {
      response.status(500).send(err)
    })
})

app.listen(process.env.PORT || 8080, function () {
  console.log("Listening on " + process.env.PORT + "...")
})

// Consumer Key	TBg3eEJQBI6g2aREnh9Ucg
// Consumer Secret	Sk0RFjcik4A6pJRl3yuhny7gO_U
// Token	jrv05Y-N9WFVxcWglBect5gumna_tjht
// Token Secret	0dBETlrTp_o5HALBcKXJb7IMvcE
