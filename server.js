// server.js
// where your node app starts
// init project

var express = require('express');
var app = express();

var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var mongoose = require('mongoose');

var Url = require('./models/url');
var ShortURL = require('./urlcodec.js');

var webhost = "https://blossom-respect.glitch.me/";

mongoose.connect(process.env.DB_URI, {
  useMongoClient: true,
  /* other options */
}, function(error) {
  if (error) console.log("Unable to connect to the mongoDB server. Error: " + error);
});

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/:encoded_id', function(req, res){
  var encoded = req.params.encoded_id;
  var id = ShortURL.decode(encoded);

  Url.findOne({_id: id}, function (err, doc){
    if (doc) {
      res.redirect(doc.url);
    } else {
      res.end(JSON.stringify({"error":"This url is not on the database."}));
    }
  });
});

app.use("/shortme/", function (req, res) {
  
  var url = req.path.slice(1);  
  var isValidUrl = /^((https?|ftp):\/\/(www\.)?[a-z0-9]{3,}\.\w{2,3}(\/[a-z0-9]+)*)$/.test(url);
  
  if (isValidUrl) {
    //THIS APP DOESN'T HANDLE DUPLICATES AT THE MOMENT
    var newUrl = Url({
      url: url
    });

    // save the new link
    newUrl.save( function(err) {
      if (err) console.log(err);
    
      var shortUrl = webhost + ShortURL.encode(newUrl._id);
      res.end(JSON.stringify({ 
           "original_url" : url,
           "short_url" : shortUrl
          }));
    });
  }
  else {
    res.end(JSON.stringify({"error":"Wrong url format, make sure you have a valid protocol and real site."}))
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
