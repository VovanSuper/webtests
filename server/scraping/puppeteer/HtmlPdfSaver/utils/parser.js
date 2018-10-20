const fs = require('fs');

const args = [
  '--fast-start',
  '--enable-tcp-fastopen',
  '--no-sandbox',
  '--no-zygote',
  '--ignore-certificate-errors',
  '--proxy-server="direct://"',
  '--proxy-bypass-list=*'
];

let parse = async ({ ctx, url, timeout, userAgent, outputHtml, outputPdf }) => {
  try {
    const page = await ctx.newPage();
    console.log(`Creating new page in current context`);
    // await page.setViewport({ width: 1000, height: 500 });
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'de' });

    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    // checkFilesAlreadyExist(fileToWriteHTML, fileToWritePDF);
    let pdfBuff = await page.pdf({ format: 'A4' });
    let htmlBuff = await page.content();
    dataWritter({ paths: { outputHtml, outputPdf }, contents: { htmlBuff, pdfBuff } });
    page
      .on('pageerror', err => { throw err })
      .on('error', err => { throw err })
      .on('close', () => console.log('Closing page'));

    // setImmediate(() => {
    return page.close();
    // });
  }
  catch (err) {
    throw err;
  }
};

const createBrowserCtx = async ({ puppeteer, timeout }) => {
  return puppeteer.launch({ headless: true, timeout: parseInt(timeout), args }).then(async browser => {
    console.log('Creating Incognito context...');
    const ctx = await browser.createIncognitoBrowserContext();
    return { ctx };
  })
    .catch(err => { throw err });
}

const dataWritter = ({ paths, contents }) => {
  fs.writeFileSync(paths.outputHtml, contents.htmlBuff, { flag: 'w', encoding: 'utf-8' });
  fs.writeFileSync(paths.outputPdf, contents.pdfBuff, { flag: 'w', encoding: 'utf-8' });
}

module.exports = { parse, createBrowserCtx }