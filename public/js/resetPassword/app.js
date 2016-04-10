var resetPasswordApp = angular.module('resetPasswordApp', ['ngMaterial', 'restangular', 'ngMessages']);

resetPasswordApp.config(function($mdThemingProvider, RestangularProvider, $interpolateProvider){
	$mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('green');
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
});

resetPasswordApp.controller('resetPasswordController', function($scope, resetPasswordService, $mdToast, $rootScope) {
	$scope.user = user;
	$scope.resetPassword = function() {
		if($scope.resetPassword.password && $scope.resetPassword.password != "" && $scope.resetPassword.confirmPassword && 
			$scope.resetPassword.confirmPassword != "") {
			if($scope.resetPassword.password == $scope.resetPassword.confirmPassword) {
				resetPasswordService.resetPassword($scope.resetPassword.password).then(function(data){
					window.location.replace('/');
				}, function(err){
					$scope.resetPasswordForm.confirmPassword.$error.serverError = true;
					$scope.resetPasswordForm.confirmPassword.$invalid = true;
				});
			} else {
				$scope.resetPasswordForm.confirmPassword.$error.passwordsNotMatching = true;
				$scope.resetPasswordForm.confirmPassword.$invalid = true;
			}
		}
	}
});