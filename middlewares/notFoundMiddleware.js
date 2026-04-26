const path = require('path');

const notFoundMiddleware = (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ msg: 'Route does not exist' });
  }

  res.status(404).sendFile(path.join(__dirname, '..', 'public', 'not-found.html'));
};

module.exports = notFoundMiddleware;
