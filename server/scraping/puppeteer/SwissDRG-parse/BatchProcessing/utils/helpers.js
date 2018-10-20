const path = require('path');
const fs = require('fs');

const checkFilesAlreadyExist = (...files) => {
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`File ${file} aleready exists... unlinking...`)
      fs.unlinkSync(file);
    }
  });
}

const getDirFullPath = (datadirname) => {
  let dataDirPath = path.join(process.cwd(), datadirname);
  if (!fs.existsSync(dataDirPath)) {
    fs.mkdirSync(dataDirPath, { recursive: true });
  }
  return dataDirPath;
}

module.exports = { checkFilesAlreadyExist, getDirFullPath };