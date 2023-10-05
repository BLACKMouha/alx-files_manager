const { getStats, getStatus } = require('../controllers/AppController');
const { default: postNew } = require('../controllers/UsersController');

const linkRoutes = (server) => {
  server.get('/status', getStatus);
  server.get('/stats', getStats);
  server.post('/users', postNew);
};

module.exports = linkRoutes;
