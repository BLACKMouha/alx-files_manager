const { getStats, getStatus } = require('../controllers/AppController');
const { default: UsersController } = require('../controllers/UsersController');

const linkRoutes = (server) => {
  server.get('/status', getStatus);
  server.get('/stats', getStats);
  server.post('/users', UsersController.postNew);
};

module.exports = linkRoutes;
