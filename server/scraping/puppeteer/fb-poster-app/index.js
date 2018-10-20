const http = require('http');
require('dotenv').config()

let Authenticator = require('./pup-auth');
let request = require('request');

let logginData = {
  email: process.env.FB_USER_EMAIL,
  password: process.env.FB_USER_PASS,
  clientId: process.env.FB_APP_ID,
  clientSecret: process.env.FB_APP_SECRET,
  redUri: process.env.FB_APP_REDIRECT_URI
};

const fbBaseUri = 'https://facebook.com';
const fbGraphBaseUri = 'https://graph.facebook.com/v2.11';
let queryGraphFieldString = 'id,name,email,birthday,';
const fbOauthBaseUri = `${fbBaseUri}/dialog/oauth`
const fbOauthAppUri = `${fbOauthBaseUri}?client_id=${logginData.clientId}&redirect_uri=${logginData.redUri}`;


let options = {
  userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
  version: '2.11',
  redirectUri: logginData.redUri,
  appId: logginData.clientId,
  appSecret: logginData.clientSecret
}

let requestOpts = {
  headers: {
    'User-Agent': options.userAgent
  }
}
let pup = new Authenticator();
let auth = pup.authenticate();


let server = http.createServer((req, resp) => {
  auth.then(auth => {
    if (!auth) {
      throw 'Puppeteer returned no data.. Something Wrong..!';
    }

    console.dir(auth);
    
    console.log(`Incomming AT::: ${auth.access_token}`)
    request.get(`${fbGraphBaseUri}/me?fields=name,email,birthday&access_token=${auth.access_token}`, { headers: requestOpts.headers }, (err, resp, body) => {
      if (err)
        console.err(err);

      // if(resp && resp.headers)
      //   console.dir(resp.headers);

      if (body) {
        console.dir(body)
      }
    });
    let msgToPosts = new Date().toLocaleDateString();
    request.post(`${fbGraphBaseUri}/me/feed?access_token=${auth.access_token}`,
      { headers: requestOpts.headers, body: `message=${msgToPosts}` }, (err, resp, body) => {
        if (err)
          console.error(err);

        
        console.log('POST resp data:::')
        if (resp && resp.headers)
          console.dir(resp.headers);

        if (body) {
          console.dir(body)
        }
      });
  });

  resp.statusCode = 200;
  resp.end('0');
});

server.listen(8080, () => console.log(`Listening on port ${server.address().port}`))

// fucntion makeFbPagesReq() {
//   request.post
// }