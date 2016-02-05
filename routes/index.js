var fs = require('fs');
var express = require('express');
var jQuery = require('jquery');
var router = express.Router();

var databaseURl = "mongodb://localhost:27017";
var collections = "test";
var mongojs = require('mongojs');
var db = mongojs(databaseURl, [collections]);

//db.test.insert({'lol':'haha'}, function(err, obj){
//  if (err) console.log("This is an error");
//  else console.log(obj);
//});

var error = function (err, response, body) {
  console.log('ERROR [%s]', err);
};
var success = function (data) {
  console.log('Data [%s]', data);
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile("index.html");
  //res.render('index', {
  //  title: 'Express',
  //  name: 'Eduardo'
  //});
});

router.post("/search", function(req,res){
  console.log(req._parsedUrl);
  console.log(res);
})

//var template = fs.readFile('./../views/index.ejs', 'utf-8', function(err, contents){
//  console.log(contents);
//});
var hello = function(){
  console.log("hello");
}
var Twitter = require('twitter-node-client').Twitter;

var config = {
  "consumerKey": "wMJRuTG9zsIFBZbu88d9DAxsk",
  "consumerSecret": "K0TzUqo2gePJRMmX2SKzEL9BPSyjGEZKgKRITlcZXuPCscntE8",

  "accessToken": "794908934-g6dTu3Wyjx4tlg1jfxEY0rlQMxhc4tgJahRHkX4W",
  "accessTokenSecret": "Z2JkYaxgf34lHegrTED0OOjUi9i9e0Ds2soxejvlo5jOa",
  "callBackUrl": "http://127.0.0.1:3000"
}

var twitter = new Twitter(config);

function Tweets(){
  this.author = {};
  this.date = "";
  this.text = "";
  this.hashtags = [];
};

//var button = window.document.getElementById("submitButton");
//button.addEventListener('onclick', function(){
//  console.log("Clicked");
//})
//console.log();
module.exports = router;
