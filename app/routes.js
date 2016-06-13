var jwt = require('jsonwebtoken');

var moment = require('moment');

var multer = require('multer');

var upload = multer({ dest: 'tmp/' });


var AuthorizationMiddleware = require('./middlewares/authorizationMiddleware');

var CustomRequestMiddleware = require('./middlewares/customRequestMiddleware');

var IndexController = require('./controllers/indexController.js');

var DashboardController = require('./controllers/dashBoardController.js');

var ClientController = require('./controllers/clientController.js');

var DepartmentsController = require('./controllers/departmentsController.js');

var DocsController = require('./controllers/docsController.js');

var UserController = require('./controllers/userController.js');

var BranchesController = require('./controllers/branchesController.js');

var TaskController = require('./controllers/taskController.js');

var NotificationsController = require('./controllers/notificationsController.js');

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

	apiRoutes.patch('/user/:userId/enable', UserController.enableUser);

	apiRoutes.patch('/user/:userId', UserController.updateUser);

	apiRoutes.post('/createDirectory', DocsController.createDirectory);

	apiRoutes.get('/branches', BranchesController.getBranches);

	apiRoutes.post('/branches', BranchesController.createBranch);

	apiRoutes.get('/branches/:branchId', BranchesController.getBranch);

	apiRoutes.patch('/branches/:branchId', BranchesController.updateBranch);

	apiRoutes.delete('/branches/:branchId', BranchesController.removeBranch);

	apiRoutes.patch('/branch/:branchId/enable', BranchesController.enableBranch);

	apiRoutes.post('/departments', DepartmentsController.createDepartment);

    apiRoutes.get('/departments', DepartmentsController.getDepartments);

    apiRoutes.patch('/departments/:departmentId', DepartmentsController.updateDepartment);

    apiRoutes.delete('/departments/:departmentId', DepartmentsController.removeDepartment);	

	apiRoutes.post('/task', TaskController.assignTask);

	apiRoutes.get('/tasks', TaskController.getTasks);

	apiRoutes.get('/task/:taskId', TaskController.getTask);

	apiRoutes.get('/mastertasks', TaskController.getMasterTasks);

	apiRoutes.patch('/task/:taskId', TaskController.updateTask);

	apiRoutes.get('/task/:taskId/reqDocs', TaskController.getReqDocs);

	apiRoutes.patch('/taskStatus', TaskController.updateTaskStatus);

	apiRoutes.delete('/task/:taskId', TaskController.removeTask);

	apiRoutes.get('/notifications', NotificationsController.getNotifications);

	apiRoutes.get('/notificationscount', NotificationsController.getNotificationsCount);

	apiRoutes.patch('/notifications/read', NotificationsController.markAllNotificationsAsRead);

	apiRoutes.patch('/notifications/read/:notificationId', NotificationsController.markNotificationAsRead);

	apiRoutes.patch('/client/:clientId/status', ClientController.updateClientStatus);
}