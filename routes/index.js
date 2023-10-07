const AppController = require('../controllers/AppController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const UsersController = require('../controllers/UsersController');

const linkRoutes = (server) => {
  server.get('/status', AppController.getStatus);
  server.get('/stats', AppController.getStats);

  server.post('/users', UsersController.postNew);
  server.get('/users/me', UsersController.getMe);

  server.get('/connect', AuthController.getConnect);
  server.get('/disconnect', AuthController.getDisconnect);

  server.post('/files', FilesController.postUpload);
};

module.exports = linkRoutes;
