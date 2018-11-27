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

// const fbAdAccountId = 'act_1700204596750838';
const fbAdAccountId = 'act_1964450670311274';
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
const TEST_FB_APP_TOKEN = 'EAACb81l5IZBQBAH7vtm2wOMK2F4elxw9qt0bdZB6rVMZBuRy3NCV7yDUgg3wopqsKPpEcrGdtKZBX5oCkOUBRRyvokq5J0ZCLRNh4jq4Bmb620eOxl0o3kMNnzxbPPxs8O5XLk0IqxQqsx67a1rq7z438FURevNpmSwNw3yZBG5wZDZD';
const TEST_BIZ_ID = '1964450670311274';
const TEST_AD_ADMIN_USER_TOKEN = 'EAACb81l5IZBQBAGdI9MvK7nqp9xDw9kIFiVvC7TlwEFzpEYSZAaqKGEDtYZAXMZAUUahbxBh6wX0JkpaNPodHeiEUHqGFGU59CX5ubkpW42TeZBO0MsmS8mfcX062SH6nJDRs5aYrc4ZAtTSy0UsTePOIa6KRxvFk7f2Pe1QzvigMIufqKDpCDkL2HeYEYW2uOj4bpcbRBo74RK9DdNeJEsonasJxsZCTzLFa3NlpZAT5wZDZD';
const TEST_AD_ADMIN_USER_ID = '105419377154328';
const TEST_PAGE_ID = '576517509452617';
const TEST_PAGE_TOKEN = 'EAACb81l5IZBQBAEgZAnCrIKARkRT2E1iSCOKxAQhuS5ZB7yZAZA83ZBpq3tas24cTMJoWrEc4F6MeUBIUNDV6i0G8ZAo8EORvTZBZCddOnT7ttBzUkxuhRITRo64Fpj7CVybAJyPQbHnlnkoXyJKOiBn7o1l7BGr0RVrm2dhOsNZBzglOkG83e1eBz';

// const SuperTok = 'EAAZAsnymKkFsBAG0gTpwtrUZBlFhZCRIUWwTf6xtoagIu9uM4NAYcDPHu3WZCAECejYSfkUZB881fZB0KRHk1ISaQWYQlIOrlk0vICss4x67Q0MPj9g915F4XZBTYZAG6e2Apwc3dH3c1L5rFgqBrhzPUfjlTUgnIgEaN2MYSSECdQZDZD';

// const SuperUserTokn = `${fbAdAccountId}|${SuperTok}`


// const api = bizSdk.FacebookAdsApi.init(SuperTok);
// const api = bizSdk.FacebookAdsApi.init(SuperUserTokn);
// const showDebugingInfo = true; // Setting this to true shows more debugging info.
// if (showDebugingInfo) {
//   api.setDebug(true);
// }

// const logApiCallResult = (apiCallName, data) => {
//   console.log(apiCallName);
//   if (showDebugingInfo) {
//     console.log('Data:' + JSON.stringify(data));
//   }
// };

// let account = new AdAccount(fbAdAccountId);
// const campaignFields = [
// ];
// const adCmpParamsStatus = 'PAUSED';
// const adCmpobjective = 'LINK_CLICKS';
// const campaignParams = (userId, adCmpParamsStatus, adCmpobjective) => {
//   return {
//     'name': userId,
//     'objective': adCmpobjective,
//     'status': adCmpParamsStatus
//   }
// };


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

// request.debug = true;
app.get('/api/test/camp-graph', (req, resp) => {
  // let adCampaign = account.createCampaign(
  //   campaignFields,
  //   campaignParams(TEST_PAGE_ID, adCmpParamsStatus, adCmpobjective)
  // ).then(res => console.dir(res))
  //   .catch(err => console.error(err))
  // logApiCallResult('Create campaign Result', adCampaign);
})




app.post('/api/get-token', function (req, res) {
  let { userId, token, email } = req.body;
  createLongToken(token, fbappsecret, reduri, fbappId).then(resp => {
    let token = resp && JSON.parse(resp)['access_token'];
    console.log(`Exchanged LongLive Token:: \n   ${token}`);

    setUserToRTDB(userId, email, token).then(_ => {
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
        let since = new Date(((new Date()).setMonth((new Date()).getMonth() - 1)));
        until = until.toDateString(); until = until.to
        since = since.toDateString();

        // crossPostVideoFb(fbPageId, pageToken, id)
        //   .then(crossPostVidRes => {
        //     console.log(`Sent CrossPost Request ${JSON.stringify(crossPostVidRes, null, 2)}`);
        //     request(`${baseGraphUri}/${id}?fields=source,created_time,id,is_crosspost_video,permalink_url&access_token=${pageToken}`)
        //       .then(res => {
        //         console.log(`RESPONSE from Video edge::: ${JSON.stringify(res.body || res.error || res)}`);
        //       })
        //       .catch(err => { throw err });
        getAddId()
          .then((ad_id) => {
            return createAdCampaign(ad_id);
          })
          .then(({ ad_id, campaign_id }) => {
            return createAdSet(ad_id, campaign_id)
          })
          .then(async ({ ad_id, ad_set_id, campaign_id }) => {
            let page_video_id = `${fbPageId}_${id}`;
            let videoDataP = await getVideoData(page_video_id);
            let { picture, ...rest } = JSON.parse(videoDataP);
            console.log(`Uploaded video pic (thumbnain):: ${picture}`);
            console.log(`Uploaded video id:: ${id}`);
            console.dir(rest);
            // id = id.substr(id.indexOf('_') + 1, id.lenght);
            console.log(`Uploaded video id:: ${id}`);
            return { ad_id, ad_set_id, campaign_id, picture, id };
          })

          .then(({ ad_id, ad_set_id, campaign_id, picture, id }) => {
            request({
              method: 'POST',
              uri: `https://graph.facebook.com/v3.2/${ad_id}/adcreatives?access_token=${TEST_AD_ADMIN_USER_TOKEN}`,
              formData: {
                object_story_spec: JSON.stringify({
                  page_id: TEST_PAGE_ID,
                  video_data: {
                    call_to_action: { type: "LIKE_PAGE", value: { page: TEST_PAGE_ID } },
                    video_id: id,
                    image_url: picture
                  }
                })
              }
            })
              .then(adcreativeRes => {
                console.log(`AddCreative :::`);
                console.dir(adcreativeRes);
              })
          })
          .catch(err => { throw err });

        getVideoInsights(fbPageId, pageToken, since, until).then((insRet) => {
          console.log(`Insights return...`);
          let insights = JSON.parse(insRet)['data'];
          console.log(`Insights for video ${id} Are::: \n   ${insights} `);

          saveInsToRTDB({ fbUserId, fbPageId, pageToken, pageName, id, insights })
            .then(_ => {
              console.log('Video insights are set to firebase..')
              return res.json({
                success: true,
                video_id: id,
                insights: insights
              });
            });
        })
          .catch(err => { throw err });
        // })
        // .catch(err => console.error(err['message'], err['code'] || err))
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

let saveInsToRTDB = ({ fbUserId, fbPageId, pageToken, pageName, id, insights }) => {
  return ref.root.child(fbUserId).push({
    'FACEBOOK-CONNECT': {
      'PAGE': fbPageId,
      'TOKEN': pageToken,
      'NAME': pageName
    }
  }).then(_ => {
    return ref.root.child(fbUserId).child('POSTS').push({
      'PostID': id,
      'METRICS': insights
    });
  });
}

let getVideoData = (video_id) => {
  return request(`${baseGraphUri}/${video_id}?fields=name,id,source,description,from,icon,permalink_url,picture&access_token=${TEST_PAGE_TOKEN}`);
}

let createAdSet = async (ad_id, campaign_id) => {
  const adsetRes = await request({
    method: 'POST',
    uri: `https://graph.facebook.com/v3.2/${ad_id}/adsets?access_token=${TEST_AD_ADMIN_USER_TOKEN}`,
    formData: {
      name: 'Test Ad set',
      billing_event: 'IMPRESSIONS',
      bid_amount: '100',
      daily_budget: '1000',
      campaign_id: campaign_id,
      targeting: JSON.stringify({ "geo_locations": { "countries": ["RU"] }, "publisher_platforms": ["facebook"] }),
      start_time: (new Date(Date.now())).toLocaleDateString('ru'),
      end_time: new Date((new Date(Date.now()).setMonth((new Date()).getMonth() + 1))).toLocaleDateString('ru'),
      optimization_goal: 'REACH'
    }
  });
  let ad_set_id = JSON.parse(adsetRes)['id'];
  console.log(`AdSet created:: ${ad_set_id}`);
  return { ad_set_id, ad_id, campaign_id };
}

let createAdCampaign = async (ad_id) => {
  const resp = await request({
    method: 'POST',
    uri: `https://graph.facebook.com/v3.2/${ad_id}/campaigns?access_token=${TEST_AD_ADMIN_USER_TOKEN}&name=L3 With Lifetime Budget&objective=LINK_CLICKS&status=PAUSED`
  });
  let campaign_id = JSON.parse(resp)['id'];
  console.log(`Campaign created::: ${campaign_id}`);
  return { ad_id, campaign_id };
}

let getAddId = async () => {
  const resp = await request(`https://graph.facebook.com/v3.2/me/adaccounts?access_token=${TEST_AD_ADMIN_USER_TOKEN}`);
  let ad_id = JSON.parse(resp)['data'][0]['id'];
  console.log(`Add id: ${ad_id}`);
  return ad_id;
}

let createLongToken = (fbUserToken, secret, redUri, clientId) => {
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

let getVideoInsights = (vidId, access_token, since, until) => {
  const insightsOpts = {
    method: 'GET',
    // uri: `https://graph.facebook.com/v3.2/${id}/insights?metric=page_positive_feedback_by_type&since=${since}&until=${until}&access_token=${access_token}`,
    uri: `${videoGraphUri}/${vidId}/insights?metric=page_video_views_autoplayed&page_video_views_click_to_play&page_video_views_unique&page_video_repeat_views&page_video_complete_views_30s&page_video_views&since=${since}&until=${until}&access_token=${access_token}`,
    // uri: `https://graph.facebook.com/v3.2/${id}/insights?metric=post_video_complete_views_organic&access_token=${access_token}`,
  };
  return request(insightsOpts);
}

let postVideoFb = (id, access_token, file_url, file_name, mimetype) => {
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
          filename: file_name || 'test_vid.mp4',
          contentType: mimetype || 'video/mp4'
        }
      }
    }
  };
  return request(postVideoOptions);
}

let crossPostVideoFb = (id, access_token, video_id) => {
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

let setUserToRTDB = (userId, fbUserEmail, token) => {
  return ref.parent.child(userId).set({
    token: token,
    email: fbUserEmail
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});