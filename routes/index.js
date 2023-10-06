const AppController = require('../controllers/AppController');
// const { default: AuthController } = require('../controllers/AuthController');
const UsersController = require('../controllers/UsersController');

const linkRoutes = (server) => {
  server.get('/status', AppController.getStatus);
  server.get('/stats', AppController.getStats);
  server.post('/users', UsersController.postNew);
  // server.get('/connect', AuthController.getConnect);
  // server.get('/disconnect', AuthController.getDisconnect);
  // server.get('/users/me', AuthController.getMe);
};

module.exports = linkRoutes;
