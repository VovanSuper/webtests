const fs = require('fs');
const request = require('request-promise');

const { audiencesRulsSet } = require('./fb-biz-sdk.conf');
const { fbUris, AdObjs, TEST_FB_CREDS } = require('../conf/base.conf');


const { ref } = require('./firebase-admin');

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

let saveInsToRTDB = async ({ fbUserId, fbPageId, pageToken, pageName, id, insights }) => {
  await ref.root.child(fbUserId).push({
    'FACEBOOK-CONNECT': {
      'PAGE': fbPageId,
      'TOKEN': pageToken,
      'NAME': pageName
    }
  });
  await ref.root.child(fbUserId).child('POSTS').push({
    'PostID': id,
    'METRICS': insights
  });
  return { fbUserId, fbPageId, pageToken, pageName, id, insights };
}

let setUserToRTDB = async ({ userId, email, token }) => {
  let userSetP = await ref.parent.child(userId).set({
    token,
    email
  });
  return { userId, token };
}

let getVideoData = async ({ video_id, ad_admin_token }) => {
  let videoDataP = await request(`${baseGraphUri}/${video_id}?fields=name,id,source,description,from,icon,permalink_url,picture&access_token=${ad_admin_token}`);
  let { picture, id, ...rest } = JSON.parse(videoDataP);
  console.log(`Uploaded video pic (thumbnain):: ${picture}`);
  console.log(`Uploaded video id:: ${id}`);
  console.dir(rest);
  // id = id.substr(id.indexOf('_') + 1, id.lenght);
  return { picture, id };
}


let createLongToken = async ({ token, fbappsecret, reduri, fbappId }) => {
  let fbTokenOpts = {
    method: 'GET',
    uri: tokenRefrGraphUri,
    // uri: `https://graph.facebook.com/oauth/client_code`,
    qs: {
      grant_type: 'fb_exchange_token',
      client_id: fbappId,
      client_secret: fbappsecret,
      fb_exchange_token: token,
      //  access_token: fbUserToken
      // , redirect_uri: redUri
    }
  }
  const resp = await request(fbTokenOpts);
  let { access_token } = resp && JSON.parse(resp);
  console.log(`Exchanged LongLive Token:: \n   ${token}`);
  return { token: access_token };
}

let getVideoInsights = async ({ video_id, access_token, since, until }) => {
  const insightsOpts = {
    method: 'GET',
    // uri: `https://graph.facebook.com/v3.2/${id}/insights?metric=page_positive_feedback_by_type&since=${since}&until=${until}&access_token=${access_token}`,
    uri: `${videoGraphUri}/${video_id}/insights?metric=page_video_views_autoplayed&page_video_views_click_to_play&page_video_views_unique&page_video_repeat_views&page_video_complete_views_30s&page_video_views&since=${since}&until=${until}&access_token=${access_token}`,
    // uri: `https://graph.facebook.com/v3.2/${id}/insights?metric=post_video_complete_views_organic&access_token=${access_token}`,
  };
  const insRet = await request(insightsOpts);
  console.log(`Insights return...`);
  let insights = JSON.parse(insRet)['data'];
  console.log(`Insights for video ${id} Are::: \n   ${insights} `);
  return { insights };
}

let postVideoFb = async ({ page_id, access_token, file_url, file_name, mimetype }) => {
  //   const id = 'page or user id goes here';  
  // const access_token = 'for page if posting to a page, for user if posting to a user\'s feed';
  const postVideoOptions = {
    method: 'POST',
    uri: `${videoGraphUri}/${page_id}/videos`,
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
  let postVidP = await request(postVideoOptions);
  let { id } = JSON.parse(postVidP);
  console.log(`Video Id is::: ${page_id}`);
  return { video_id: id, page_id };
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

let createAdSet = async ({ ad_id, campaign_id, ad_admin_token, video_id, page_id }) => {
  const adsetRes = await request({
    method: 'POST',
    uri: `https://graph.facebook.com/v3.2/${ad_id}/adsets?access_token=${ad_admin_token}`,
    formData: {
      name: 'Test Ad set',
      billing_event: 'IMPRESSIONS',
      bid_amount: 130,
      daily_budget: 100,
      campaign_id: campaign_id,
      targeting: JSON.stringify({ "geo_locations": { "countries": ["US"] }, "publisher_platforms": ["facebook"] }),
      start_time: (new Date(Date.now())).toLocaleDateString('ru'),
      end_time: new Date((new Date(Date.now()).setMonth((new Date()).getMonth() + 1))).toLocaleDateString('ru'),
      optimization_goal: 'REACH'
    }
  });
  let ad_set_id = JSON.parse(adsetRes)['id'];
  console.log(`AdSet created:: ${ad_set_id}`);
  return { ad_set_id, ad_id, campaign_id, ad_admin_token, video_id, page_id };
}

let createAdCampaign = async ({ ad_id, ad_admin_token, video_id, page_id }) => {
  const resp = await request({
    method: 'POST',
    uri: `https://graph.facebook.com/v3.2/${ad_id}/campaigns?access_token=${ad_admin_token}&name=L3 With Lifetime Budget&objective=LINK_CLICKS&status=PAUSED`
  });
  let campaign_id = JSON.parse(resp)['id'];
  console.log(`Campaign created::: ${campaign_id}`);
  return { ad_id, campaign_id, ad_admin_token, video_id, page_id };
}

let getAddId = async ({ ad_admin_token, video_id, page_id }) => {
  const resp = await request(`https://graph.facebook.com/v3.2/me/adaccounts?access_token=${ad_admin_token}`);
  let ad_id = JSON.parse(resp)['data'][0]['id'];
  console.log(`Add id: ${ad_id}`);
  return { ad_id, ad_admin_token, video_id, page_id };
}

let createAdCreative = ({ ad_id, id, picture, page_id, ad_admin_token }) => {
  request.debug = this;
  return request({
    method: 'POST',
    uri: `https://graph.facebook.com/v3.2/${ad_id}/adcreatives`,
    formData: {
      object_story_spec: JSON.stringify({
        page_id: page_id,
        video_data: {
          call_to_action: { type: "LIKE_PAGE", value: { page: page_id } },
          video_id: id,
          image_url: picture
        }
      })
    },
    qs: {
      access_token: ad_admin_token
    }
  })
    .finally(() => { request.debug = false })
}

module.exports = {
  saveInsToRTDB,
  getVideoData,
  createAdSet,
  createAdCampaign,
  getAddId,
  createLongToken,
  getVideoInsights,
  postVideoFb,
  crossPostVideoFb,
  setUserToRTDB,
  createAdCreative
}
