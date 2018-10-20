const path = require('path');
require('dotenv').config({
  path: path.join(process.cwd(), '.env')
});

module.exports = {
  url: process.env.BATCHURL,
  baseUrl: process.env.BASEURL,
  timeout: parseInt(process.env.TIMEOUT),
  userAgent: process.env.USERAGENT,
  batchProcDataDir: process.env.BATCHPROCDATADIRNAME,
  selSystem: process.env.BATCHSELECTORSYSTEMVAL,
  selLeist: process.env.BATCHSELECTORLEISTVAL,
  selEing: process.env.BATCHSELECTOREINGVAL,
}