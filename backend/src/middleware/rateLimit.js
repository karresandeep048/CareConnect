/**
 * Minimal dependency-free fixed-window rate limiter (per IP).
 * usage: app.use('/api/auth', rateLimit({ windowMs: 60000, max: 30 }))
 */
const rateLimit = ({ windowMs = 60000, max = 100, message = 'Too many requests, please try again shortly.' } = {}) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ message });
    }
    next();
  };
};

module.exports = { rateLimit };
