const path = require('path');
const admin = require('firebase-admin');

const dbUrl = 'https://sandbox-aymatic.firebaseio.com';

const serviceAccount = require(path.join(__dirname, '..', 'conf/sandbox-aymatic-firebase-adminsdk-v7x50-83dc423e99.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: dbUrl
});
let db = admin.database();

let ref = db.ref('/UserData')
ref.once('value', function (snapshot) {
  console.log(snapshot.val());
});


module.exports = { ref };