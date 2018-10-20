const path = require('path');
const url = require('url');
const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');
const env = require(path.join(__dirname, 'utils/env'));
const { getDirFullPath } = require(path.join(__dirname, 'utils/helpers'));


(async () => {
  const selectors = {
    systemSel: '#system-dropdown',
    leistSel: '#care-provider',
    systemOptSel: '#system-dropdown > div.selection > div.option',
    leistOptSel: '#care-provider > div.selection > div.option',
    switchesContSel: '#container > main > div > div > div:nth-child(2) > fieldset > div > div._Rfxe_ > div > div',
    inputSel: '#container > main > div > div > div._Rfx4_._Rfxg_._Rfxh_ > div > div > input[type="file"]',
    uploadBtnSel: '#container > main > div > div > div:nth-child(4) > div > div._Rfxl_ > button'
    //, svcSel: '#container > main > div > div > div:nth-child(5) > div > div.ui.positive.message.big._Rfx4_._Rfxh_._Rfxp_ > div > div:nth-child(1) > p > a'
  }
  let browser = await puppeteer.launch({
    headless: true,
    timeout: env.timeout,
    dumpio: true,
    // appMode: true,
    // slowMo: 100,
    // devtools: true,
    // defaultViewport: {
    //   height: 768,
    //   width: 1280
    // }
    // ,    args: ['--profile-directory="Default"', '--user-data-directory="Default"']
  });

  try {
    // let cxtx = await browser.createIncognitoBrowserContext();
    const sampleDataApiUrl = 'https://grouper.swissdrg.org/api/batchgroup/swissdrg';
    let downloadPath = getDirFullPath(env.batchProcDataDir);
    let page = await browser.newPage();
    await page.setRequestInterception(true);

    browser.on('close', () => {
      if (!page.isClosed()) {
        page.close().then(async () => {
          browser.emit('disconnected');
          await browser.close();
        });
      }
    });

    page.on('request', async (req) => {
      console.log(`Requst: ${req.method()} - ${req.url()}`);
      if (req.url().includes('.svc'))
        console.log(`Requesting svc file...`);

      return await req.continue();
    })
      .on('requestfinished', async (req) => {
        if (req.url().includes(sampleDataApiUrl) && req.method().includes('POST') && req.response().ok()) {
          let respJson = await req.response().json();
          console.log(`Send sample data to server!.. ${JSON.stringify(respJson)}`);
          let downloadLnk = `${env.baseUrl}${respJson.link_to_result}`;
          let downloadFileUrl = url.parse(downloadLnk);
          let downloadFileName = downloadFileUrl.pathname.substring(downloadFileUrl.pathname.lastIndexOf('/') + 1);
          console.log(`File ::  ${downloadFileName} ... downloading...`);
          const headers = {
            'User-Agent': env.userAgent,
            'Referer': req.url()
          };
          let svcPathOnDisk = path.join(downloadPath, downloadFileName);
          request.get(downloadLnk, { headers })
            .pipe(
              fs.createWriteStream(svcPathOnDisk, { autoClose: true, flags: 'w' })
                .on('open', (fd) => console.log(`Writting to path: ${svcPathOnDisk} ...`))
                .on('finish', async (fd) => {
                  setImmediate(async () => {
                    page.waitFor(1000).then(() => {
                      browser.emit('close');
                    })
                  });
                })
            )
        }
      });

    await page.setUserAgent(env.userAgent);
    await page.goto(env.url, { referer: env.url, timeout: env.timeout, waitUntil: 'networkidle2' });

    await (await page.$(selectors.systemSel)).click();
    await page.evaluate((env, selectors) => {
      let opts = document.querySelectorAll(selectors.systemOptSel);
      opts.forEach(opt => {
        if (opt.innerText.indexOf(env.selSystem) > -1) {
          opt.click();
          return;
        }
      });
    }, env, selectors);

    await (await page.$(selectors.leistSel)).click();
    await page.evaluate((env, selectors) => {
      let opts = document.querySelectorAll(selectors.leistOptSel);
      opts.forEach(opt => {
        if (opt.innerText.indexOf(env.selLeist) > -1) {
          opt.click();
          return;
        }
      });
    }, env, selectors);



    await page.evaluate((env, selectors) => {
      let sw = document.querySelectorAll(selectors.switchesContSel);

      for (let item of sw) {
        let lb = item.querySelector('label');
        if (lb.innerText.indexOf(env.selEing) > -1)
          lb.click();
      }
    }, env, selectors)

    await page.waitFor(100);


    let input = await page.$(selectors.inputSel);
    input.uploadFile(path.join(__dirname, 'example.txt'));
    await page.waitFor(200);


    await (await page.$(selectors.uploadBtnSel)).click();

    // await page.waitFor(100);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: env.timeout });


    // let svc = await page.$(selectors.svcSel);

    // await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './' });
    // await svc.hover();
    // await svc.click({ clickCount: 1, delay: 1000 });

    if (!page.isClosed()) {
      await page.close();
    }
  }
  catch (err) {
    console.error(err.message || err.msg || err.errorCode);
  }
  finally {
    if (browser)
      await browser.close();
  }

})();