const path = require('path');
require('dotenv').config({
  path: path.join(process.cwd(), '.env')
});

module.exports = {
  url: process.env.SINGLEURL,
  timeout: parseInt(process.env.TIMEOUT),
  userAgent: process.env.USERAGENT,
  singleProcDataDir: process.env.SINGLEPROCDATADIRNAME
}