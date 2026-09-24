// Tiny access logger: METHOD /path STATUS 12ms
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
};

module.exports = { requestLogger };
