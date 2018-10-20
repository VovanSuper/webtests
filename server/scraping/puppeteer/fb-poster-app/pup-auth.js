const puppeteer = require('puppeteer');
const _ = require('lodash');
const querystring = require('querystring');
require('dotenv').config();

const envOpts = {
  email: process.env.FB_USER_EMAIL,
  password: process.env.FB_USER_PASS,
  clientId: process.env.FB_APP_ID,
  clientSecret: process.env.FB_APP_SECRET,
  // redUri: encodeURIComponent(process.env.FB_APP_REDIRECT_URI)  
  redUri: process.env.FB_APP_REDIRECT_URI
};

const fbBaseUri = 'https://facebook.com';
const fbBaseLoginUri = `${fbBaseUri}/login.php`;

const fbGraphBaseUri = 'https://graph.facebook.com/v2.11';
// const fbTokenDebugBaseUri = 'https://graph.facebook.com/v2.11/debug_token';
let queryGraphFieldString = 'id,name,email,birthday';
const fbOauthBaseUri = `${fbBaseUri}/dialog/oauth`
const fbOauthAppUri = `${fbOauthBaseUri}?client_id=${envOpts.clientId}&redirect_uri=${envOpts.redUri}`;
const userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';

function makeFbAccessTokenReclaimUri(code) {
  // const fbAccessTokenReclaimUri = `${fbGraphBaseUri}/oauth/access_token?client_id=${envOpts.clientId}&redirect_uri=${envOpts.redUri}&&client_secret=${envOpts.clientSecret}&code=${code}`
  if (!code || code.trim() === '')
    throw 'No code defined of code is empty!!!';

  return `${fbGraphBaseUri}/oauth/access_token?client_id=${envOpts.clientId}&redirect_uri=${envOpts.redUri}&&client_secret=${envOpts.clientSecret}&code=${code}`
}

function makeFbDebugTokenUri(access_Token) {
  if (!access_Token || access_Token === '')
    throw 'No access_token provided for Debuging!!!';

  // return `${fbTokenDebugBaseUri}?input_token=${access_Token}&access_token=${access_Token}`;
  return `${fbGraphBaseUri}/me?access_token=${access_Token}`
}

class Authenticator {
  // code
  // access_Token
  // user_id
  // _envOpts
  // _puppet
  constructor(puppetOpts) {
    this._defaultPupOpts = {
      // headless: false,
      // appMode: true,
      dumpio: false,
      // timeout: 0,
      // devtools: true,
      // ignoreHTTPSErrors: true,
      // slowMo: 100
    };

    this._envOpts = envOpts;
    this._puppetOpts = _.assign({}, this._defaultPupOpts, puppetOpts || {});
    this.code;
    this.access_token;
    this.user_id;
  }

  authenticate() {
    console.log('Starting Pptr')

    return puppeteer.launch(this._puppetOpts).then(browser => {

      return browser.newPage().then(page => {

        return page.setUserAgent(userAgent).then(() => {
          // return page.goto(fbBaseUri).then(resp => {
          // if (resp.status() === (200 || 201 || 203)) {
          // page.on('console', msg => console.log('PAGE LOG:', msg.text()));


          page.setRequestInterception(true).then(() => {



            page.on('response', (resp) => {
              // console.log(`Response URL :: ${resp.url()}`)
              let respUrl = resp.url();

              // resp redirected to <returnUrl> with <code> param
              if (resp.ok() && respUrl.startsWith(envOpts.redUri)) {
                let codeMathers = respUrl.match(/[#\/]?code=(.*?)(#_=_)(&|$)/);
                this.code = codeMathers && codeMathers[1];
                console.log('Matched code in url ');
                // if (this.code) {
                console.log(`Code is:: ${this.code}`);
                // }
              }

              // resp with url <graph.facebook.com/v2.11/oauth/access_token> to get `access token` by exchanging the <code>
              if (resp.ok() && respUrl.startsWith(fbGraphBaseUri) && respUrl.indexOf('oauth/access_token') > -1) {
                resp.json().then(data => {
                  console.log('setting ACCESSTOKEN')
                  this.access_Token = data && data['access_token'];
                  // if (this.access_Token) {
                  console.log(`Access_Token:: ${this.access_Token}`);
                  // access_Token = accessToken;
                  // }
                })
                  .catch(err => console.log('Error in ACCESS_TOKEN req!!!'))
              }

              // resp with url <graph.facebook.com/v2.11/mefields=name,id,email&access_token=...> to get `user id`
              if (resp.ok() && respUrl.indexOf('/me?access_token=') > -1) {
                console.log(`REQUESTING DEBUG URL (/me?access_token=):::: ${respUrl}`)
                resp.json().then(data => {
                  if (data && data.error)
                    throw data.error;

                  if (data) {
                    console.log('DEBUG DATA:::')
                    console.dir(data);
                    this.user_id = data && data['id'];
                  }
                  else {
                    throw 'No DATA retured by DegubTokenURI'
                  }
                }).catch(err => console.error(err))
              }

              // url to make initial graph request
              if (resp.ok() && respUrl.includes(`fields=${queryGraphFieldString}&access_token=`)) {
                resp.json().then(data => {
                  if (data.error)
                    throw data.error;

                  if (data) {
                    console.log('GRAPH RESPONSE:::');
                    console.dir(data)
                  }
                })
              }
              // if (resp.url().indexOf(`${fbBaseUri}/login.php`) > -1) {
              //   page.type('input#email', envOpts.email).then(() => {
              //     page.type('input#pass', envOpts.password).then(() => {
              //       page.click('#loginbutton', { delay: 200 }).then(() =>{
              //         console.log('Clicked on Loging Button... submited Login form')
              //       })
              //     })
              //   })
              // }
            });

            page.on('request', (req) => {
              if (req.url().startsWith(fbGraphBaseUri)) {
                console.log(`\nRequesting url ::: ${req.url()}\n`)

              }
              // req.respond({})
              req.continue();

            });
            // https://facebook.com/dialog/oauth?client_id=1825033960857449&redirect_uri=http://localhost:8080

          })
          return page.goto(fbBaseLoginUri)
            .then(() => page.type('input#email', envOpts.email))
            .then(() => page.type('input#pass', envOpts.password))
            .then(() => page.click('#loginbutton', { delay: 200 }))
            .then(() => page.waitForNavigation({ waitUntil: 'domcontentloaded' }))
            .then(() => page.goto(fbOauthAppUri))
            // .then(() => page.waitForNavigation({ waitUntil: 'load' }))
            // .then(() => page.waitFor(500))
            .then(() => page.goto(makeFbAccessTokenReclaimUri(this.code)))
            // .then(() => page.waitForNavigation({ waitUntil: 'load' }))
            .then(() => page.waitFor(500))
            .then(() => page.goto(makeFbDebugTokenUri(this.access_Token)))
            // .then(() => page.waitForNavigation({ waitUntil: 'load' }))
            .then(() => page.waitFor(500))
            // .then(() => page.title().then(title => console.log(title)))

            .then(() => {
              console.log('RETURNING DATA ...:')
              let data = {
                access_token: this.access_Token,
                user_id: this.user_id
              };
              console.dir(data);
              return data;
            })
            .then(params => {
              let gUrl = `${fbGraphBaseUri}/${params.user_id}?fields=${queryGraphFieldString}&access_token=${params.access_token}`;
              console.log('GRAPTH query::: ', gUrl);
              page.goto(gUrl)
            })
            // .then(() => page.waitForNavigation({ waitUntil: 'load' }))
            .then(() => page.waitFor(1500))

            .then(() => console.log('Navigation finished...!'))
            .then(() => console.log('Closing headless browser...'))
            .then(() => browser.close())
            .then(() => {
              return {
                access_token: this.access_Token,
                user_id: this.user_id
              }
            })
            .catch(err => { throw err });
        }).catch(err => { throw err });

      })
    })
  }
}

module.exports = Authenticator;
