var basepath = "/templates";

var Caweb = angular.module('Caweb', ['ngMaterial', 'ngRoute', 'restangular', 'ngMessages',
	'md.data.table', 'ngFileUpload', 'mdPickers']);

Caweb.constant('Tabs', [
	'Dashboard',
	'Clients',
	'Documents',
	'Manage Users',
	'Branches',
    'Department Management',
	'Assign Task',
	'Tasks',
	'Reports'
])
.constant('TaskStatus', [
	'Visit Pending',
    'Visit Done',
    'No Response',
	'Checklist Pending',
	'Checklist Done',
	'Documents Submitted',
	'Waiting For Approval',
	'Completed'
]);

Caweb.config(function($mdThemingProvider, RestangularProvider, $routeProvider, $interpolateProvider){
	$mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange');
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
    RestangularProvider.setBaseUrl('/api/');
    RestangularProvider.setDefaultHeaders({
    	'x-ca-api-token' : apiKey
    });
    $routeProvider
        .when("/dashboard", {
            templateUrl : basepath + "/_dashboard.html",
            controller  : "dashboardController"
        })
        .when('/client/new', {
        	templateUrl : basepath + "/_addClient.html",
        	controller : "addClientController"
        })
        .when('/clients', {
        	templateUrl : basepath + "/_searchClient.html",
        	controller : "searchClientController"
        })
        .when('/documents', {
        	templateUrl : basepath + "/_clientArea.html",
        	controller : "clientAreaController"
        })
        .when('/documents/:clientId', {
        	templateUrl : basepath + "/_clientArea.html",
        	controller : "clientAreaController"
        })
        .when('/downloadCount/', {
        	templateUrl : basepath + "/_downloadCount.html",
        	controller : "downloadCountController"
        })
        .when('/downloadCount/:clientId', {
        	templateUrl : basepath + "/_downloadCount.html",
        	controller : "downloadCountController"
        })
        .when('/reports', {
        	templateUrl : basepath + "/_reports.html",
        	controller : "reportsController"
        })
        .when('/users', {
        	templateUrl : basepath + "/_users.html",
        	controller : "usersController"
        })
        .when('/branches', {
        	templateUrl : basepath + "/_branches.html",
        	controller : "branchesController"
        })
        .when('/departments', {
            templateUrl : basepath + "/_departments.html",
            controller : "departmentsController"
        })
        .when('/tasks', {
        	templateUrl : basepath + "/_tasks.html",
        	controller : "tasksController"
        })
        .when('/task/:taskId', {
        	templateUrl : basepath + "/_viewTask.html",
        	controller : "viewTaskController"
        })
        .when('/task/:taskId/edit', {
        	templateUrl : basepath + "/_editTask.html",
        	controller : "editTaskController"
        })
        .when('/assigntask', {
        	templateUrl : basepath + "/_assignTask.html",
        	controller : "assignTaskController",
        	resolve : {
        		access : ['UserService' , function(UserService) {
        			return UserService.isAdmin();
        		}]
        	}
        })
        //.otherwise('/dashboard');
});

Caweb.run(function($rootScope, UserService, $mdToast, Tabs, $location, CAService){
	$rootScope.user = UserService.getUserDetails();
	$rootScope.tabs = Tabs;
	$rootScope.tabsMap = {};
	$rootScope.viewTask = function(item) {
        if(!item.client_enquiry_id) {
            $location.path('/task/'+item.task_id);   
        } else {
            $location.path('/assigntask').search({client_name : item.name, mobile : item.mobile});
        }
	}
	for(i in $rootScope.tabs) {
		$rootScope.tabsMap[$rootScope.tabs[i]] = parseInt(i);
	}
    var Notifications = function() {
        this.loadedPages = {};
        /** @type {number} Total number of items. *
/        this.numItems = 0;
        /** @const {number} Number of items to fetch per request. */
        this.PAGE_SIZE = 10;
        this.fetchNumItems_();
    };

        // Required.
        Notifications.prototype.getItemAtIndex = function(index) {
          var pageNumber = Math.ceil(index / this.PAGE_SIZE)?Math.ceil(index / this.PAGE_SIZE):1;
          var page = this.loadedPages[pageNumber];
          if (page) {
            return page[index % this.PAGE_SIZE];
          } else if (page !== null) {
            this.fetchPage_(pageNumber);
          }
        };
        // Required.
        Notifications.prototype.getLength = function() {
          return this.numItems;
        };
        Notifications.prototype.fetchPage_ = function(pageNumber) {
          // Set the page to null so we know it is already being fetched.
          this.loadedPages[pageNumber] = null;
          var obj = this;
          // For demo purposes, we simulate loading more items with a timed
          // promise. In real code, this function would likely contain an
          // $http request.
            CAService.getNotifications(pageNumber).then(function(data) {
                obj.loadedPages[pageNumber] = data;
            });
        };
        Notifications.prototype.fetchNumItems_ = function() {
          // For demo purposes, we simulate loading the item count with a timed
          // promise. In real code, this function would likely contain an
          // $http request.
          var obj = this;
          CAService.getNotificationsCount().then(function(data) {
                obj.numItems = data[0].unreadCount;
                $rootScope.unreadNotificationsCount = data[0].unreadCount;
            });
        };
	$rootScope.notifications = new Notifications();
    $rootScope.markAllNotificationsAsRead = function() {
    	CAService.markAllNotificationsAsRead().then(function() {
    		angular.forEach($rootScope.notifications.notifications, function(notification) {
    			$rootScope.unreadNotificationsCount = 0;
    			notification.is_read = 1;
    		});
    	});
    }
    $rootScope.markNotificationAsRead = function(notification) {
    	CAService.markNotificationAsRead(notification.id).then(function() {
    		$rootScope.unreadNotificationsCount -= 1;
    		notification.is_read = 1;
    	});
    }
	$rootScope.openUserMenu = function($mdOpenMenu, ev) {
		$mdOpenMenu(ev);
	}
	$rootScope.toggleNotifications = function(event) {
		if($rootScope.notificationsOpen) {
			$rootScope.notificationsOpen = false;
		} else {
			$rootScope.notificationsOpen = true;
		}
	}
	$rootScope.logout = function(){
		UserService.logout().then(function(){
			window.location.replace('/');
		}, function() {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to logout the user")
			.position("top right")
			.hideDelay(5000));
		});
	}
	$rootScope.openClientMenu = function($mdOpenMenu, ev) {
		console.log("hover");
		$mdOpenMenu(ev);
	}
	$rootScope.showUserProfile = function(ev) {

	}

    $rootScope.$on('$routeChangeStart', function() {
        $rootScope.showAppLoader = true;
    });
    $rootScope.$on('$routeChangeSuccess', function() {
        $rootScope.showAppLoader = false;
        $rootScope.notificationsOpen = false;
    });
	$rootScope.switchTab = function(index) {
		if($rootScope.user.role == "CLIENT") {
			index = $rootScope.tabsMap['Client Area'];
		}
		switch(index) {
			case $rootScope.tabsMap['Dashboard'] : $location.path('/dashboard');
				break;
			case $rootScope.tabsMap['Clients'] : $location.path('/clients');
				break;
			case $rootScope.tabsMap['Documents'] : $location.path('/documents');
				break;
			case $rootScope.tabsMap['Download Count'] : $location.path('/downloadCount');
				break;
			case $rootScope.tabsMap['Manage Users'] : $location.path('/users');
				break;
			case $rootScope.tabsMap['Branches'] : $location.path('/branches');
				break;
			case $rootScope.tabsMap['Department Management'] : $location.path('/departments');
                break;
            case $rootScope.tabsMap['Assign Task'] : $location.path('/assigntask');
				break;
			case $rootScope.tabsMap['Tasks'] : $location.path('/tasks');
				break;
			case $rootScope.tabsMap['Reports'] : $location.path('/reports');
				break;
		}
	}

});
