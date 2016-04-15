var basepath = "/templates";

var Caweb = angular.module('Caweb', ['ngMaterial', 'ngRoute', 'restangular', 'ngMessages', 
	'md.data.table', 'ngFileUpload']);

Caweb.constant('Tabs', [
	'Dashboard',
	'Add Client',
	'Search Client',
	'Client Area',
	'Download Count',
	'Manage Users',
	'Reports'
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
        .when('/clientArea', {
        	templateUrl : basepath + "/_clientArea.html",
        	controller : "clientAreaController"
        })
        .when('/clientArea/:clientId', {
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
        .otherwise('/dashboard');
});

Caweb.run(function($rootScope, UserService, $mdToast, Tabs, $location){
	$rootScope.user = UserService.getUserDetails();
	$rootScope.tabs = Tabs;
	$rootScope.tabsMap = {};
	for(i in $rootScope.tabs) {
		$rootScope.tabsMap[$rootScope.tabs[i]] = parseInt(i);
	}
	$rootScope.openUserMenu = function($mdOpenMenu, ev) {
		$mdOpenMenu(ev);
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

	$rootScope.switchTab = function(index) {
		if($rootScope.user.role == "CLIENT") {
			index = $rootScope.tabsMap['Client Area'];
		}
		switch(index) {
			case $rootScope.tabsMap['Dashboard'] : $location.path('/dashboard');
				break;
			case $rootScope.tabsMap['Add Client'] : $location.path('/client/new');
				break;
			case $rootScope.tabsMap['Search Client'] : $location.path('/clients');
				break;
			case $rootScope.tabsMap['Client Area'] : $location.path('/clientArea');
				break;
			case $rootScope.tabsMap['Download Count'] : $location.path('/downloadCount');
				break;
			case $rootScope.tabsMap['Manage Users'] : $location.path('/users');
				break;
			case $rootScope.tabsMap['Reports'] : $location.path('/reports');
				break;
		}
	}

});