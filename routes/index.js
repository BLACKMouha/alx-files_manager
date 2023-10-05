const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const linkRoutes = (server) => {
  server.get('/status', AppController.getStatus);
  server.get('/stats', AppController.getStats);
  server.post('/users', UsersController.postNew);
};

module.exports = linkRoutes;
