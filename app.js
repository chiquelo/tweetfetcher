var fs = require('fs');
var express = require('express');
var databaseURl = "mongodb://Eduardo:1234@ds055545.mongolab.com:55545/heroku_7ddh1v6z";
var collections = "tweets";
var mongojs = require('mongojs');
var db = mongojs(databaseURl, [collections]);
var sentiment = require('sentiment');

var Twitter = require('twitter-node-client').Twitter;

var config = {
  "consumerKey": "wMJRuTG9zsIFBZbu88d9DAxsk",
  "consumerSecret": "K0TzUqo2gePJRMmX2SKzEL9BPSyjGEZKgKRITlcZXuPCscntE8",

  "accessToken": "794908934-g6dTu3Wyjx4tlg1jfxEY0rlQMxhc4tgJahRHkX4W",
  "accessTokenSecret": "Z2JkYaxgf34lHegrTED0OOjUi9i9e0Ds2soxejvlo5jOa",
  "callBackUrl": "http://127.0.0.1:3000"
}

//db.test.insert({'lol':'haha'}, function(err, obj){
//  if (err) console.log("This is an error");
//  else {
//    console.log(obj);
//  }
//});

var twitter = new Twitter(config);

var error = function (err, response, body) {
  console.log('ERROR');
  console.log(err);
};
var success = function (data) {
  //console.log('Data [%s]', data);
};

var express = require('express');
var app = express();
var path = require('path');
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use("/public",express.static(path.join(__dirname, 'public')))
// use res.render to load up an ejs view file

// index page

app.get('/', function(req, res) {
    db.tweets.createIndex({ text: 'text'}, { "hashtags.text": 'text'});
    res.sendFile(__dirname + "/public/tweetfetcher.html");
    threadCounter = 0;
    allTweets = [];
});
var subject;

app.get('/results', function(req, res){
  //res.sendFile(__dirname + "/public/results.ejs");
    console.log("Tweets being displayed: " + allTweets.length);

    if(allTweets.length != 0) {
        for (var i = 0; i < allTweets.length; i++) {
            var date = allTweets[i].date;
            date = date.split('+');
            var year = date[1].substring(4, date[1].length);
            allTweets[i].newDate = date[0] + year;

            var score = sentiment(allTweets[i].text).score;
            if(score > 0) {
                allTweets[i].score = 'active';
            } else if(score < 0){
                allTweets[i].score = 'danger';
            } else{
                allTweets[i].score = 'info';
            }
        }

        res.render("results", {
            tweets: allTweets,
            subject: subject
        });
        allTweets = [];
    } else {
        res.redirect('/');
    }
});


app.get('/request', function(req, res){

    var url = req._parsedUrl;
    if(url.query || url.query != ''){
        var params = url.query.split("=");
        subject = params[1];
        params = params[1].split("+");
        var word = "";
        for(var i = 0; i < params.length; i++){
            word += params[i];
        }
        if(word != '') {
            db.tweets.find(
                {
                    $text: {$search: subject}
                }, function (err, obj) {
                    if (err) {
                        console.log(err);
                        //res.redirect('/');
                    }
                    else {
                        console.log("There are " + obj.length + " fetched from db");
                        console.log(obj);
                        //twitter.getSearch({'q':'#parisattacks','count': 10}, error, success);
                        fetchTweets(params, obj, res);
                    }
                });
        } else {
            res.redirect('/');
        }
        //res.sendStatus(200);
    } else {
        res.redirect('/');
    }
});

app.listen(8080);
console.log('8080 is the magic port');

function Tweets(){
  this.name = {};
  this.author = {};
  this.date = "";
  this.text = "";
  this.hashtags = [];
  this.tweetId = "";
};

var threadCounter = 0;
var allTweets = [];

var fetchTweets = function(params, tweets, res){

    // Ease access to tweetIds to avoid repetitions in db
    var hash = {};
    for(var i = 0; i < tweets.length; i++){
        hash[tweets[i].tweetId] = true;
    }
    // MODIFIED QUERY TO NOT HAVE TO DO THIS
    //// Check all rows in db
    //for(var i = 0; i < tweets.length; i++){
    //    var tweet = tweets[i];
    //    var keepTweet = false;
    //    // Look for hashtags of elements in db
    //    //console.log(tweet.hashtags);
    //    for(var j = 0; j < tweet.hashtags.length; j++){
    //        var unhashtag = tweet.hashtags[j].text;
    //        // Compare text in hashtag with input
    //        for(var k = 0; k < params.length; k++){
    //            // If they are equal, keep them as elements of the list
    //            if(unhashtag.toLowerCase() == params[k].toLowerCase){
    //                keepTweet = true;
    //                break;
    //            }
    //        }
    //        if(keepTweet) break;
    //    }
    //    if(!keepTweet) {
    //        tweets.splice(i, 1);
    //        i--;
    //    } else {
    //        console.log("Keep tweet");
    //        allTweets.push(tweet);
    //    }
    //}
    //console.log("Total tweets after filter " + allTweets.length);

    var possibleSearches = getPossibleSearches(params);

    for(var l = 0; l < possibleSearches.length; l++) {

        twitter.getSearch({
            'q': possibleSearches[l],
            'result_type': 'popular',
            'lang': 'en'
        }, error, function (data) {
              data = JSON.parse(data);
              var statuses = data.statuses;

            for(var i = 0; i < statuses.length; i++){
                var tweet = statuses[i];
                var hasHashtag = false
                for(var j = 0; j < tweet.entities.hashtags.length; j++){
                    //console.log(tweet.entities.hashtags);
                    if(tweet.entities.hashtags) {
                        var text = tweet.entities.hashtags[j].text;
                        if (text == subject) {
                            hasHashtag = true;
                            break;
                        }
                    }
                }
                if(!hasHashtag) {
                    tweet.entities.hashtags.push({
                        text: subject
                    });
                }
                var dbTweet = new Tweets();
                dbTweet.date = tweet.created_at;
                dbTweet.name = tweet.user.name;
                dbTweet.author = tweet.user.screen_name;
                dbTweet.hashtags = tweet.entities.hashtags;
                dbTweet.tweetId = tweet.id;
                dbTweet.text = tweet.text;
                allTweets.push(dbTweet);

                if(hash[dbTweet.tweetId] || dbTweet.text == '')
                  continue;

                db.tweets.update(
                    {"tweetId": dbTweet.tweetId},
                    {
                        'tweetId': dbTweet.tweetId,
                        'name': dbTweet.name,
                        'author': dbTweet.author,
                        'date': dbTweet.date,
                        'hashtags': dbTweet.hashtags,
                        'text': dbTweet.text
                    },
                    {"upsert" : true}
                , function(err, obj){
                    if (err) {
                        console.log("Couldn't insert object");
                        console.log(err);
                    }
                });
            }
            threadCounter++;
            if(threadCounter == 2) res.redirect('/results')
        });
    }
}

var getPossibleSearches = function(params){
  var possibleSearches = [];
  var query1 = "";
  for (var i = 0; i < params.length; i++) {
    query1 += params[i] + " ";
  }

  possibleSearches.push(query1);
  var query2 = "#"
  if (params[0].charAt(0) !== '#') {
    for (var i = 0; i < params.length; i++) {
      query2 +=params
    }
  }
    //var query3 = "#"
    //var hash = {
    //    'the' : true,
    //    'a' : true,
    //    'of' : true,
    //    'in' : true
    //}
    //if(params[0].charAt(0) != '#'){
    //    for(var i = 0; i < params.length; i++){
    //        if(!hash[params[i]]) query3 += params[i] + " ";
    //    }
    //}

  possibleSearches.push(query2);
  return possibleSearches;
}

module.exports = app;
