// const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const app = express();
const router = express.Router();
const request = require('request-promise');
const cors = require('cors');
const favicon = require('serve-favicon');
const static = require('serve-static');

const bizSdk = require('facebook-nodejs-business-sdk');


const { ref } = require(path.join(__dirname, 'helpers/firebase-admin'));

// const admin = require('firebase-admin');
// const serviceAccount = require(path.join(__dirname, 'conf/sandbox-aymatic-firebase-adminsdk-v7x50-83dc423e99.json'));

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://sandbox-aymatic.firebaseio.com'
// });
// let db = admin.database();

// let ref = db.ref('/UserData')
// ref.once('value', function (snapshot) {
//   console.log(snapshot.val());
// });


const reduri = 'https://sandbox-aymatic.firebaseapp.com/__/auth/handler';
const fbappId = '2213536835598072';
const fbappsecret = 'd2bb3b3c32251a57c6721489996b1668';

const baseGraphUri = 'https://graph.facebook.com/v3.2';
const videoGraphUri = 'https://graph-video.facebook.com/v3.2';
const tokenRefrGraphUri = 'https://graph.facebook.com/oauth/access_token';

const fbAdAccountId = 'act_1700204596750838';
const fbAdSecret = 'd2bb3b3c32251a57c6721489996b1668';
const fbAdPixelId = '2075537329134115';

// const fbCampagneUri = `https://graph.facebook.com/v3.2/act_${fbAdAccountId}/campaigns`;
const Ad = bizSdk.Ad;
const AdAccount = bizSdk.AdAccount;
const Business = bizSdk.Business;
const AdCampaign = bizSdk.Campaign;
const AdCustomAudience = bizSdk.CustomAudience;
// const AdsPixel = bizSdk.AdsPixel;

// const api = bizSdk.FacebookAdsApi.init(access_token);

let userid = `23003953000398304`;
const TEST_USER_TOKEN = 'EAAfdMzTIdvgBAE5SFGdEMvdEoAq6eZAVtWbygHcKvYbaUXK4r4ZBWQ1zftt8rmKNivBziDseCxFjLbp6YNQL8PEYZB4TCQ2hVZAQrS12Xx6SYetpzNWxYSZBRv8J7FZBgHtZCSvv6x1ZAjhGZBRgAKR5OUrRODWaYhyDbQ3680L6BNgZDZD'
const TEST_USER_ID = '2252816714953420';
const TEST_PAGE_ID = '576517509452617';
const TEST_PAGE_TOKEN = 'EAAfdMzTIdvgBAOWZCCLVchg7nMhNan0LIwwFcg6T9mIfVB8LmPdqrK9TZBhTCRqcMM5HY9MVV28HZCPGoU4mOjD1RWFq0EtZBmgGcFZCbvzZCzmB9k1jRM9fFf8vGStKszeUOyA1oIJ3ZCeIjX9TJKEVUv59XKFyUy6NP7HqEPTTFozLeFXn84T';

const SuperTok = 'EAAZAsnymKkFsBAG0gTpwtrUZBlFhZCRIUWwTf6xtoagIu9uM4NAYcDPHu3WZCAECejYSfkUZB881fZB0KRHk1ISaQWYQlIOrlk0vICss4x67Q0MPj9g915F4XZBTYZAG6e2Apwc3dH3c1L5rFgqBrhzPUfjlTUgnIgEaN2MYSSECdQZDZD';

const SuperUserTokn = `${fbAdAccountId}|${SuperTok}`


const api = bizSdk.FacebookAdsApi.init(SuperTok);
// const api = bizSdk.FacebookAdsApi.init(SuperUserTokn);
const showDebugingInfo = true; // Setting this to true shows more debugging info.
if (showDebugingInfo) {
  api.setDebug(true);
}

const logApiCallResult = (apiCallName, data) => {
  console.log(apiCallName);
  if (showDebugingInfo) {
    console.log('Data:' + JSON.stringify(data));
  }
};

let account = new AdAccount(fbAdAccountId);
const campaignFields = [
];
const adCmpParamsStatus = 'PAUSED';
const adCmpobjective = 'LINK_CLICKS';
const campaignParams = (userId, adCmpParamsStatus, adCmpobjective) => {
  return {
    'name': userId,
    'objective': adCmpobjective,
    'status': adCmpParamsStatus
  }
};


const audiencesRulsSet = (fbAdPixelId, UrlOfOutputJson) => {
  return {
    'rule':
    {
      'inclusions': {
        'operator': 'or', 'rules': [{
          'event_sources': [{ 'id': `${fbAdPixelId}`, 'type': 'pixel' }],
          'retention_seconds': 8400,
          'filter': {
            'operator': 'and',
            'filters':
              [{ 'field': 'url', 'operator': 'i_contains', 'value': `${UrlOfOutputJson}` }]
          }
        }]
      }
    }
  }
}

const DIR = path.join(__dirname, 'uploads');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
  }
});

let upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(favicon(path.join(__dirname, '..', 'dist/client/favicon.ico')));
app.use(static(path.join(__dirname, '..', 'dist/client')));
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
//   res.setHeader('Access-Control-Allow-Methods', 'POST');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });

app.use(function (req, resp, next) {
  if (req.method == 'POST') {
    console.log(`Request: ${req.method} - ${req.originalUrl}`);
    console.log('Body:')
    console.dir(req.body);
  }
  next();
});


app.get('/api/camp', (req, resp) => {
  let adCampaign = account.createCampaign(
    campaignFields,
    campaignParams(TEST_PAGE_ID, adCmpParamsStatus, adCmpobjective)
  ).then(res => console.dir(res))
    .catch(err => console.error(err))
  logApiCallResult('Create campaign Result', adCampaign);
});


app.post('/api/get-token', function (req, res) {
  let { userId, token, email } = req.body;
  createLongToken(token, fbappsecret, reduri, fbappId).then(resp => {
    let token = resp && JSON.parse(resp)['access_token'];
    console.log(`Exchanged LongLive Token::\n   ${token}`);

    setUserToRtDb(userId, email, token).then(_ => {
      return res.json({ token });
    })
  })
    .catch(err => console.error(err.message))
});

app.post('/api/upload', upload.single('photo'), function (req, res) {
  if (!req.file) {
    console.log('No file received');
    return res.send({
      success: false
    });

  } else {
    let { fbToken, fbPageId, fbUserId, pageToken, pageName, email } = req.body;
    let { path, filename, mimetype } = req.file;
    console.log('file received');

    setImmediate(() => {
      postVideoFb(fbPageId, pageToken, path, filename, mimetype).then(data => {
        let { id } = JSON.parse(data);
        console.log(`Video Id is::: ${id}`);
        let until = new Date();
        let since = new Date((until.setMonth(until.getMonth() - 1)))
        until = until.toDateString();
        since = since.toDateString();

        crossPostVideoFb(fbPageId, pageToken, id)
          .then(crossPostVidRes => {
            console.log(`Sent CrossPost Request ${JSON.stringify(crossPostVidRes, null, 2)}`);
            request(`${baseGraphUri}/${id}?fields=source,created_time,id,is_crosspost_video,permalink_url&access_token=${pageToken}`)
              .then(res => {
                console.log(`RESPONSE from Video edge::: ${JSON.stringify(res.body || res.error || res)}`);
              })
              .catch(err => { throw err });

            getVideoInsights(fbPageId, pageToken, since, until).then((insRet) => {
              console.log(`Insights return...`);
              let insights = JSON.parse(insRet)['data'];
              console.log(`Insights for video ${id} Are::: \n   ${insights}`);

              ref.root.child(fbUserId).push({
                'FACEBOOK-CONNECT': {
                  'PAGE': fbPageId,
                  'TOKEN': pageToken,
                  'NAME': pageName
                }
              }).then(_ => {
                ref.root.child(fbUserId).child('POSTS').push({
                  'PostID': id,
                  'METRICS': insights
                })
              })
                .then(_ => {
                  console.log('Video insights are set to firebase..')
                  return res.json({
                    success: true,
                    video_id: id,
                    insights: insights
                  })
                })

              // ref.set(id).then(() => {
              //   ref.child(id).update({ isights: insRet }).then(() => console.log('Insights are SET!!!!!!!!!!!!!'))
              //     .catch(err => { throw err })
              // })
              //   .catch(err => { throw err });

              // return res.json({
              //   success: true,
              //   data: data
              // });
            })
              .catch(err => { throw err });
          })
          .catch(err => console.error(err['message'], err['code'] || err))
      },
        err => {
          console.error(err.message);
          return res.json({
            success: false,
            err: err
          });
        });
    });
  }
});

app.get('*', (req, resp) => {
  resp.status(200).sendFile(path.join(__dirname, '..', 'dist/client/index.html'))
});

function createLongToken(fbUserToken, secret, redUri, clientId) {
  let fbTokenOpts = {
    method: 'GET',
    uri: tokenRefrGraphUri,
    // uri: `https://graph.facebook.com/oauth/client_code`,
    qs: {
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: secret,
      fb_exchange_token: fbUserToken,
      //  access_token: fbUserToken
      // , redirect_uri: redUri
    }
  }
  return request(fbTokenOpts);
}

function getVideoInsights(vidId, access_token, since, until) {
  const insightsOpts = {
    method: 'GET',
    // uri: `https://graph.facebook.com/v3.2/${id}/insights?metric=page_positive_feedback_by_type&since=${since}&until=${until}&access_token=${access_token}`,
    uri: `${videoGraphUri}/${vidId}/insights?metric=page_video_views_autoplayed&page_video_views_click_to_play&page_video_views_unique&page_video_repeat_views&page_video_complete_views_30s&page_video_views&since=${since}&until=${until}&access_token=${access_token}`,
    // uri: `https://graph.facebook.com/v3.2/${id}/insights?metric=post_video_complete_views_organic&access_token=${access_token}`,
  };
  return request(insightsOpts);
}

function postVideoFb(id, access_token, file_url, file_name, mimetype) {
  //   const id = 'page or user id goes here';  
  // const access_token = 'for page if posting to a page, for user if posting to a user\'s feed';
  const postVideoOptions = {
    method: 'POST',
    uri: `${videoGraphUri}/${id}/videos`,
    // uri: `https://graph.facebook.com/v3.2/${id}/photos`,
    qs: {
      access_token: access_token,
      // caption: `Name: ${file_name}`
      description: `Vid Name ${file_name}`
    },
    formData: {
      file: {
        value: fs.createReadStream(file_url),
        options: {
          filename: file_name,
          contentType: mimetype || 'video/mp4'
        }
      }
    }
  };
  return request(postVideoOptions);
}

function crossPostVideoFb(id, access_token, video_id) {
  const crossPostOpts = {
    method: 'POST',
    uri: `${videoGraphUri}/${id}/videos`,
    formData: {
      access_token: access_token,
      crossposted_video_id: video_id
    }
  };
  return request(crossPostOpts);
}

function setUserToRtDb(userId, fbUserEmail, token) {
  return ref.parent.child(userId).set({
    token: token,
    email: fbUserEmail
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});