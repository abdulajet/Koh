require('dotenv').config()
const Twitter = require('twitter');
const Express = require('express');

const twitterUsername = "@abdulajet"

const twitterClient = new Twitter({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SECRET,
  access_token_key: process.env.A_KEY,
  access_token_secret: process.env.A_SECRET
});

// You can also get the stream in a callback if you prefer.
const stream = twitterClient.stream('statuses/filter', {track: twitterUsername});

stream.on('data', function(event) {
  var handle = event.user.screen_name;
  var tweetId = event.id_str;
  var img = event.entities.media[0].media_url_https;
  stealFace(handle, tweetId, img);
});

stream.on('error', function(error) {
  console.log(error);
});

function stealFace(handle, tweetId, img) {
  //img as a url pls
  reply(handle, tweetId, img)
}

function reply(handle, tweetId, img) {
  twitterClient.post('statuses/update', {status: `@${handle} This is an automated test ${img}`, in_reply_to_status_id: tweetId}, function(error, tweet, response) {
    if (error) {
      console.log(error)
    } else {
      console.log(tweet);
    }
  });
}
