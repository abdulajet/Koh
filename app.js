require('dotenv').config()
var Twitter = require('twitter');
var Express = require('express');

var twitterClient = new Twitter({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SECRET,
  access_token_key: process.env.A_KEY,
  access_token_secret: process.env.A_SECRET
});

twitterClient.get('statuses/mentions_timeline', function(error, tweets, response) {
  if(error) throw error;
  console.log(tweets);  // The favorites.
  //console.log(response);  // Raw response object.
});
