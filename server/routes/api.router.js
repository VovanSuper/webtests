const express = require('express');
const path = require('path');
const multer = require('multer');


const { fbUris, AdObjs, TEST_FB_CREDS } = require('../conf/base.conf');
const { audiencesRulsSet } = require('../helpers/fb-biz-sdk.conf');

const {
  createAdCampaign,
  createAdCreative,
  createAdSet,
  createLongToken,
  crossPostVideoFb,
  getAddId,
  getVideoData,
  getVideoInsights,
  postVideoFb,
  saveInsToRTDB,
  setUserToRTDB
} = require('../helpers/services');

const {
  baseGraphUri,
  fbAdAccountId,
  fbAdPixelId,
  fbAdSecret,
  fbappId,
  fbappsecret,
  reduri,
  tokenRefrGraphUri,
  videoGraphUri
} = fbUris;

const uploadDIR = path.join(process.cwd(), 'server/uploads');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
  }
});
let upload = multer({ storage });

const router = express.Router();

router.route('/test/camp-graph')
  .get((req, resp, next) => {
    // let adCampaign = account.createCampaign(
    //   campaignFields,
    //   campaignParams(TEST_PAGE_ID, adCmpParamsStatus, adCmpobjective)
    // ).then(res => console.dir(res))
    //   .catch(err => console.error(err))
    // logApiCallResult('Create campaign Result', adCampaign);
  });

router.route('/exchange-token')
  .post((req, resp, next) => {
    let { userId, token, email } = req.body;

    createLongToken({ token, fbappsecret, reduri, fbappId })
      .then(({ token }) => {
        return setUserToRTDB({ userId, email, token })
      })
      .then(({ userId, token }) => resp.json({ userId, token }))
      .catch(err => next(err))
  });

router.route('/upload')
  .post(
    upload.single('photo'),
    (req, resp, next) => {
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

        // postVideoFb({ fbPageId, pageToken, path, filename, mimetype} )
        postVideoFb({ page_id: fbPageId, access_token: pageToken, file_url: path, file_name: filename, mimetype })
        // postVideoFb({ page_id: fbPageId, access_token: fbToken, file_url: path, file_name: filename, mimetype })
          .then(({ video_id, page_id }) => {
            // crossPostVideoFb(fbPageId, pageToken, id)
            //   .then(crossPostVidRes => {
            //     console.log(`Sent CrossPost Request ${JSON.stringify(crossPostVidRes, null, 2)}`);
            //     request(`${baseGraphUri}/${id}?fields=source,created_time,id,is_crosspost_video,permalink_url&access_token=${pageToken}`)
            //       .then(res => {
            //         console.log(`RESPONSE from Video edge::: ${JSON.stringify(res.body || res.error || res)}`);
            //       })
            //       .catch(err => { throw err });
            // return getAddId({ ad_admin_token: pageToken, video_id, page_id })
            return getAddId({ ad_admin_token: fbToken, video_id, page_id })
          })
          .then(({ ad_id, ad_admin_token, video_id, page_id }) => createAdCampaign({ ad_id, ad_admin_token, video_id, page_id }))

          .then(({ ad_id, campaign_id, ad_admin_token, video_id, page_id }) => createAdSet({ ad_id, campaign_id, ad_admin_token, video_id, page_id }))

          .then(async ({ ad_set_id, ad_id, campaign_id, ad_admin_token, video_id, page_id }) => {
            let page_video_id = `${fbPageId}_${video_id}`;
            // let { picture, id } = await getVideoData(page_video_id);
            let { picture, id } = await getVideoData({ video_id: page_video_id, ad_admin_token });

            return { ad_id, ad_set_id, campaign_id, picture, id, page_id, ad_admin_token };
          })

          .then(({ ad_id, ad_set_id, campaign_id, picture, id, page_id, ad_admin_token }) => createAdCreative({ ad_id, id, picture, page_id, ad_admin_token }))
          .then(adcreativeRes => {
            console.log(`AddCreative :::`);
            console.dir(adcreativeRes);
          })
          .catch(err => { throw err });

        // getVideoInsights({ video_id, ad_admin_token, since, until})
        //   // .then(({ insights }) => saveInsToRTDB({ fbUserId, fbPageId, pageToken, pageName, id, insights }) )
        //   .then(_ => {
        //     console.log('Video insights are set (rtdb) ..')
        //     return resp.json({
        //       success: true,
        //       video_id: id,
        //       insights: insights
        //     });
        //   })
        //   .catch(err => { return next(err) })
      }
    });

module.exports.apiRouter = router;