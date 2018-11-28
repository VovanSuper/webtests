module.exports = (err, req, resp, next) => {
  console.error(`${err.message} ---  ${err.stack}` || err);
  return resp.status(500).json({
    success: false,
    message: err.message || err,
    statck: err.stack || err
  });
}