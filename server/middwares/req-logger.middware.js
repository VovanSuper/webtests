module.exports = (req, resp, next) => {
  if (req.method == 'POST') {
    console.log(`Request: ${req.method} - ${req.originalUrl}`);
    console.log('Body:')
    console.dir(req.body);
  }
  next();
}