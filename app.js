require('dotenv').config()
const twitter = require('twitter');

const Twitter = new twitter({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SECRET,
  access_token_key: process.env.A_KEY,
  access_token_secret: process.env.A_SECRET
});

const track = process.env.TWITTER_HANDLE;

// You can also get the stream in a callback if you prefer.
const stream = twitterClient.stream('statuses/filter', { track });

stream.on('data', event => {
  const handle = event.user.screen_name;
  const tweetId = event.id_str;
  const img = event.entities.media[0].media_url_https;
  return stealFace(handle, tweetId, img);
});

stream.on('error', error => console.log(error));

const stealFace = (handle, tweetId, img) => {
  //img as a url pls
  return reply(handle, tweetId, img);
}

const reply = (handle, in_reply_to_status_id, img) => {
  const status = `@${handle} This is an automated test ${img}`;
  twitterClient.post('statuses/update', { status, in_reply_to_status_id }, (error, tweet, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log(tweet);
    }
  });
}
