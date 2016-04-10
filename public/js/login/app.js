var LoginApp = angular.module('loginApp', ['ngMaterial', 'restangular', 'ngMessages']);

LoginApp.config(function($mdThemingProvider, RestangularProvider){
	$mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('green');
    RestangularProvider.setBaseUrl('/api/');
});

LoginApp.controller('loginController', function($scope, loginService, $mdToast) {
	$scope.signin = function() {
		if($scope.login.email && $scope.login.email != "" && $scope.login.password && 
			$scope.login.password != "") {
			loginService.signIn($scope.login).then(function(data){
				window.location.replace('/');
			}, function(err){
				if(err.errorCode == 1010) {
					$scope.loginForm.email.$error.notRegistered = true;
					$scope.loginForm.email.$invalid = true;
				} else if(err.errorCode == 1011) {
					$scope.loginForm.password.$error.incorrect = true;
					$scope.loginForm.password.$invalid = true;
				} else if(err.errorCode == 1014) {
					$scope.loginForm.password.$error.serverError = true;
					$scope.loginForm.password.$invalid = true;
				}
			});
		}
	}
});