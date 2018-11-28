// const https = require('https');
const path = require('path');

const express = require('express');

const bodyParser = require('body-parser')

const cors = require('cors');
const favicon = require('serve-favicon');
const serveStatic = require('serve-static');

const loggWare = require('./middwares/req-logger.middware')
const errorWare = require('./middwares/error.middware')

const app = express();

const { apiRouter } = require('./routes/api.router');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(favicon(path.join(__dirname, '..', 'dist/client/favicon.ico')));
app.use(serveStatic(path.join(__dirname, '..', 'dist/client')));

app.use(loggWare);
app.use('/api', apiRouter);
app.use(errorWare)

app.get('*', (req, resp) => {
  resp.status(200).sendFile(path.join(__dirname, '..', 'dist/client/index.html'))
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});

