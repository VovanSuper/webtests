


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

module.exports = { audiencesRulsSet }