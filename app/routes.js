var jwt = require('jsonwebtoken');

var moment = require('moment');

var multer = require('multer');

var upload = multer({ dest: 'tmp/' });


var AuthorizationMiddleware = require('./middlewares/authorizationMiddleware');

var CustomRequestMiddleware = require('./middlewares/customRequestMiddleware');

var IndexController = require('./controllers/indexController.js');

var DashboardController = require('./controllers/dashBoardController.js');

var ClientController = require('./controllers/clientController.js');

var DocsController = require('./controllers/docsController.js');

var UserController = require('./controllers/userController.js');

module.exports = function(app, apiRoutes, blobService) {

	app.get('/', IndexController.handle);

	app.get('/document/:id', CustomRequestMiddleware.setUser, DocsController.downloadDocument);

	app.get('/client/resetpassword', UserController.sendResetPassword);

	app.get('/user/resetpassword', UserController.sendResetPassword);

	app.post('/resetPassword/:userId', UserController.resetPassword);

	apiRoutes.post('/authenticate', UserController.authenticate);

	apiRoutes.post('/register', UserController.register);

	apiRoutes.use(AuthorizationMiddleware.authorize);

	apiRoutes.get('/logout', UserController.logout);

	apiRoutes.get('/dashboard', DashboardController.getDashboardData)

	apiRoutes.post('/client', ClientController.addClient);

	apiRoutes.get('/clients', ClientController.getClients);

	apiRoutes.get('/client/:id', ClientController.getClientDetails);

	apiRoutes.patch('/client/:id', ClientController.updateClient);

	apiRoutes.post('/upload', DocsController.uploadDoc);

	apiRoutes.get('/client/:id/docs', DocsController.getDocuments);

	apiRoutes.patch('/document/:id', DocsController.updateDocument);

	apiRoutes.delete('/document/:id', DocsController.deleteDocument);

	apiRoutes.get('/docdownloads/:clientId', DocsController.getDocDownloads);

	apiRoutes.get('/users', UserController.getUsers);

	apiRoutes.post('/user', UserController.addUser);

	apiRoutes.delete('/user/:userId', UserController.removeUser);

	apiRoutes.patch('/user/:userId', UserController.updateUser);

	apiRoutes.post('/createDirectory', DocsController.createDirectory);

	// apiRoutes.post('updateMasterAttributes', attributesController.updateAttributes);

}