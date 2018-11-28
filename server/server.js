// const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const request = require('request-promise');
const cors = require('cors');
const favicon = require('serve-favicon');
const serveStatic = require('serve-static');

const { fbUris, AdObjs, TEST_FB_CREDS } = require('./conf/base.conf');
const { audiencesRulsSet } = require('./helpers/fb-biz-sdk.conf');

const { ref } = require('./helpers/firebase-admin');

const loggWare = require('./middwares/req-logger.middware')

const app = express();

const { baseGraphUri, fbAdAccountId, fbAdPixelId, fbAdSecret, fbappId, fbappsecret } = fbUris;
// const {Ad, AdAccount, AdCampaign, AdCustomAudience} = AdObjs;


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
app.use(serveStatic(path.join(__dirname, '..', 'dist/client')));
app.use(loggWare);

// request.debug = true;
app.get('/api/test/camp-graph', (req, resp) => {

})




app.post('/api/exchange-token', (req, res, next) => {
  let { userId, token, email } = req.body;

  createLongToken(token, fbappsecret, reduri, fbappId)
    .then(({ token }) => {
      setUserToRTDB({ userId, email, token })
    })
    .then(({ userId, token }) => res.json({ userId, token }))
    .catch(err => console.error(err.message))
});

app.post('/api/upload', upload.single('photo'), function (req, resp) {
  if (!req.file) {
    console.log('No file received');
    return resp.json({
      success: false
    });

  } else {
    let { fbToken, fbPageId, fbUserId, pageToken, pageName, email } = req.body;
    let { path, filename, mimetype } = req.file;
    console.log(`File received ${filename}`);

    let until = new Date();
    let since = new Date(((new Date()).setMonth((new Date()).getMonth() - 1)));
    until = until.toLocaleDateString('ru');
    since = since.toLocaleDateString('ru');

    setImmediate(() => {
      // postVideoFb({ fbPageId, pageToken, path, filename, mimetype} )
      postVideoFb({ page_id: fbPageId, access_token: pageToken, file_url: path, file_name: filename, mimetype })
        .then(({ video_id, page_id }) => {
          // crossPostVideoFb(fbPageId, pageToken, id)
          //   .then(crossPostVidRes => {
          //     console.log(`Sent CrossPost Request ${JSON.stringify(crossPostVidRes, null, 2)}`);
          //     request(`${baseGraphUri}/${id}?fields=source,created_time,id,is_crosspost_video,permalink_url&access_token=${pageToken}`)
          //       .then(res => {
          //         console.log(`RESPONSE from Video edge::: ${JSON.stringify(res.body || res.error || res)}`);
          //       })
          //       .catch(err => { throw err });
          return getAddId({ ad_admin_token: pageToken, video_id, page_id })
        })
        .then(({ ad_id, ad_admin_token, video_id, page_id }) => createAdCampaign({ ad_id, ad_admin_token, video_id, page_id }))

        .then(({ ad_id, campaign_id, ad_admin_token, video_id, page_id }) => createAdSet({ ad_id, campaign_id, ad_admin_token, video_id, page_id }))

        .then(async ({ ad_set_id, ad_id, campaign_id, ad_admin_token, video_id, page_id }) => {
          let page_video_id = `${fbPageId}_${video_id}`;
          // let { picture, id } = await getVideoData(page_video_id);
          let { picture, id } = await getVideoData({ video_id: page_video_id, ad_admin_token });

          return { ad_id, ad_set_id, campaign_id, picture, id, page_id };
        })

        .then(({ ad_id, ad_set_id, campaign_id, picture, id, page_id }) => createAdCreative({ ad_id, id, picture, page_id }))
        .then(adcreativeRes => {
          console.log(`AddCreative :::`);
          console.dir(adcreativeRes);
        })
        .catch(err => { throw err });

      getVideoInsights(fbPageId, pageToken, since, until)
        // .then(({ insights }) => {
        //   saveInsToRTDB({ fbUserId, fbPageId, pageToken, pageName, id, insights })
        // })
        .then(_ => {
          console.log('Video insights are set to firebase..')
          return resp.json({
            success: true,
            video_id: id,
            insights: insights
          });
        })
        .catch(err => { throw err });
      // })
      // .catch(err => console.error(err['message'], err['code'] || err))
    },
      err => {
        console.error(err.message || err.stack || err);
        return resp.json({
          success: false,
          err: err.message || err.stack || err
        });
      });
  }
});

app.get('*', (req, resp) => {
  resp.status(200).sendFile(path.join(__dirname, '..', 'dist/client/index.html'))
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});

