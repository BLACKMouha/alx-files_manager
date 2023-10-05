const { getStats, getStatus } = require('../controllers/AppController');

const linkRoutes = (server) => {
  server.get('/status', getStatus);
  server.get('/stats', getStats);
};

module.exports = linkRoutes;
