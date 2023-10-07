const AppController = require('../controllers/AppController');
const AuthController = require('../controllers/AuthController');
const UsersController = require('../controllers/UsersController');

const linkRoutes = (server) => {
  server.get('/status', AppController.getStatus);
  server.get('/stats', AppController.getStats);
  server.post('/users', UsersController.postNew);
  server.get('/connect', AuthController.getConnect);
  server.get('/disconnect', AuthController.getDisconnect);
  server.get('/me', UsersController.getMe);
};

module.exports = linkRoutes;
