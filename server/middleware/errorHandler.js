const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (err.code === 11000 ? 409 : 500);
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const safeMessage = String(err.message || 'Internal Server Error')
    .replace(mongoUri || '\u0000', '[redacted MongoDB URI]')
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, '[redacted MongoDB URI]');
  const safeStack = err.stack
    ? String(err.stack)
        .replace(mongoUri || '\u0000', '[redacted MongoDB URI]')
        .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, '[redacted MongoDB URI]')
    : undefined;
  const logDetails = {
    route: req.originalUrl,
    method: req.method,
    receivedFields: Object.keys(req.body || {}),
    mongoState: require('mongoose').connection.readyState,
    errorName: err.name,
    errorCode: err.code,
    errorMessage: safeMessage
  };
  if (req.originalUrl === '/api/auth/register') {
    console.error('REGISTRATION ERROR:', JSON.stringify(logDetails));
  } else {
    console.error('[API ERROR]', JSON.stringify(logDetails));
  }
  if (process.env.NODE_ENV !== 'production' && safeStack) console.error(safeStack);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500
      ? req.originalUrl === '/api/auth/register'
        ? 'Unable to create your account. Please try again.'
        : 'Something went wrong. Please try again.'
      : safeMessage
  });
};

module.exports = errorHandler;
