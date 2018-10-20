const path = require('path');
const Scrapper = require('./Scrapper');
const { getFilesPaths, getDirFullPath } = require(path.join(__dirname, 'utils/helpers'));
const prefixify = require(path.join(__dirname, 'utils/prefixify'));
const { url, timeout, userAgent, singleProcDataDir } = require(path.join(__dirname, 'utils/env'));
const cluster = require('cluster');
const cpus = require('os').cpus().length;
const { EventEmitter } = require('events');
EventEmitter.defaultMaxListeners = 40;

let dataDirPath = getDirFullPath(singleProcDataDir);
const getSlave = () => {
  let worker = cluster.fork();
  console.log(`Running slave id ${worker.id} ...`);
  return worker;
}

if (cluster.isMaster) {
  console.log(`Running proc id ${process.pid} ...`);
  for (let p = 0; p < cpus; p++) {
    let w = getSlave();
    w.on('exit', (code, signal) => {
      if (signal) {
        console.log(`worker was killed by signal: ${signal}`);
      } else if (code && code !== 0) {
        console.log(`worker exited with error code: ${code}`);
      }
    })
      .on('online', () => console.log(`Slave online id -- ${w.id}`));

    // for (const id in cluster.workers) {
    //   cluster.workers[id].on('message', data => {
    //     console.log(`Slave id ${data.id} finished...`);
    //     cluster.workers[id].emit('exit');
    //   });
    // }
  }
}
else {
  let scrp = new Scrapper({ url, timeout, userAgent });
  const test = (async () => {
    for (let i = 0; i < 10; i++) {
      //User some other function for output files naming:
      let names = prefixify({ filename: 'Tester', prefix: i });

      let { fileToWriteHTML, fileToWritePDF } = getFilesPaths({ dataDirPath, names });
      let scraped = await scrp.scrape(fileToWriteHTML, fileToWritePDF);
      process.send({ id: process.pid, data: scraped });
    }
  });

  test();
}
