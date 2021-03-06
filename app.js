require('dotenv').config();
const twitter = require('twitter');
const fs = require('fs');
const request = require('request');
const gm = require('gm');
const Twitter = new twitter({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SECRET,
  access_token_key: process.env.A_KEY,
  access_token_secret: process.env.A_SECRET
});
const track = process.env.TWITTER_HANDLE;
const AZURE_KEY = process.env.AZURE_KEY;
const FACE_BASE_URI = process.env.FACE_BASE_URI;
const getRandomImage = () => {
  const arr = [];
  for (let i = 1; i < 10; i++) {
    arr.push(`https://raw.githubusercontent.com/abdulajet/Koh/master/images/${i}.jpg`);
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
// You can also get the stream in a callback if you prefer.
const stream = Twitter.stream('statuses/filter', { track });

stream.on('data', event => {
  const handle = event.user.screen_name;
  const tweetId = event.id_str;
  const imgUrl = event.entities.media[0].media_url_https;
  return stealFace(handle, tweetId, imgUrl);
});

stream.on('error', error => console.log(error));

const stealFace = (handle, tweetId, url) => {
  request({
    method: 'POST',
    uri: FACE_BASE_URI,
    qs: {
      returnFaceId: true,
      returnFaceLandmarks: false
    },
    json: true,
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_KEY
    },
    body: {
      url
    }
  }, (err, resp, body) => {
    if (!err) {
      let faceRectangle;
      if (body[0] && body[0].faceRectangle) {
        faceRectangle = body[0].faceRectangle;
      }
      if (!faceRectangle) {
        return replyError(handle, tweetId);
      }
      let background;
      background = getRandomImage();
      request({
        method: 'GET',
        uri: url,
        encoding: null
      }, (err, resp, body) => {
        if (!err) {
          console.log('1');
          gm(body)
          .crop(faceRectangle.width, faceRectangle.height, faceRectangle.left, faceRectangle.top)
          .write('./1.jpeg', (err) => {
            if(!err) {
              console.log('2');
              request({
                method: 'POST',
                uri: FACE_BASE_URI,
                qs: {
                  returnFaceId: true,
                  returnFaceLandmarks: false
                },
                json: true,
                headers: {
                  'Ocp-Apim-Subscription-Key': AZURE_KEY
                },
                body: {
                  url: background
                }
              }, (err, resp, body) => {
                if (!err) {
                  console.log('3');
                  faceRectangle = body[0].faceRectangle;
                  request({
                    method: 'GET',
                    uri: background,
                    encoding: null
                  }, (err, resp, body) => {
                    if (!err) {
                      console.log('4');
                      gm(body)
                      .draw(`image Over ${faceRectangle.left},${faceRectangle.top} ${faceRectangle.width},${faceRectangle.height} "./1.jpeg"`)
                      .toBuffer((err, buffer) => {
                        if (!err) {
                          console.log('5');
                          return reply(handle, tweetId, buffer);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}

const reply = (handle, in_reply_to_status_id, media) => {
  const status = `@${handle} Here is your image!`;
  // Make post request on media endpoint. Pass file data as media parameter
  Twitter.post('media/upload', { media }, function(error, img, response) {
    if (!error) {
      const media_ids = img.media_id_string;
      Twitter.post('statuses/update', { status, in_reply_to_status_id, media_ids }, function(error, tweet, response) {
        if (!error) {
          console.log(tweet);
        }
      });
    }
  });
}

const replyError = (handle, in_reply_to_status_id) => {
  const status = `@${handle} We couldn't find your face :( Try again with a different selfie!`;
  Twitter.post('statuses/update', { status, in_reply_to_status_id }, (error, tweet, response) => {
    if (!error) {
      console.log(tweet);
    }
  });
}
