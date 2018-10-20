const puppeteer = require('puppeteer');
const path = require('path');
const { parse, createBrowserCtx } = require(path.join(__dirname, 'utils/parser'));

module.exports = class Scraper {
  constructor({ url, timeout, userAgent }) {
    this._opts = {};
    this._opts.url = url;
    this._opts.timeout = timeout;
    this._opts.userAgent = userAgent;
    this.pagesCHandlers = [];
    this.init();
  }

  async init() {
    await this.getContext();
  }

  async getContext() {
    if (this.context && this.context.browser) {
      this.context = await Promise.resolve(this.context);
    } else {
      let { ctx } = await createBrowserCtx({ puppeteer, timeout: this._opts.timeout });
      this.context = ctx;
    }
  }

  async scrape(outputHtml, outputPdf) {
    try {
      setImmediate(async () => {
        await this.getContext();
        let ctx = this.context;
        let pCH = parse({ ctx, outputHtml, outputPdf, ...this._opts });
        this.pagesCHandlers.push(pCH);

        Promise.all(this.pagesCHandlers)
          .then(async () => {
            if (this.context && this.context.browser && this.context.browser.close) {
              console.log('Closing browser...');
              let bcloseRes = await this.context.browser().close();
              return Promise.resolve(bcloseRes);
            }
          })
          .then(_ => console.log('Done!'))
          .catch(err => { throw err });
      });
    }
    catch (err) {
      err => console.error(err)
    }
  }
}