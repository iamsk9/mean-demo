Caweb.controller('usersController', function($scope, $rootScope, CAService, $mdToast, $location, $mdDialog,
	UserService) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Manage Users'];
	$scope.userRoles = [
		"admin"
	];
	function getUsers() {
		var payload = {
			get_deleted : true
		};
		UserService.getUsers(payload).then(function(users){
			$scope.users = users;
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch users")
			.position("top right")
			.hideDelay(5000));
		});
	}
	function getDepartmentsList(){
		CAService.getDepartmentsList().then(function(result){
           $scope.DepartmentsList = result;
		});
	}
	getUsers();
	CAService.getBranches().then(function(data) {
		$scope.branches = data;
		var branches = {};
		for(var i = 0; i < $scope.branches.length; i++) {
			branches[$scope.branches[i].id] = $scope.branches[i];
		}
		$scope.branches = branches;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Error occurred in getting Branches.")
		.position("top right")
		.hideDelay(5000));
	});
	getDepartmentsList();
	function showDialog(){
		$mdDialog.show({
	    	controller : function($scope, theScope) {
	    		$scope.theScope = theScope
	    		$scope.$watch('userForm', function() {
	    			$scope.theScope.userForm = $scope.userForm;
	    		}, true);
	    	},
			templateUrl : 'user.tmpl.html',
			parent : angular.element(document.body),
			clickOutsideToClose:true,
			locals : {
				theScope : $scope
			}
		}).then(function(){
		});
	}

	$scope.closeDialog = function() {
		$mdDialog.cancel();
		$scope.currentUser = {};
	}

	$scope.showAddUserDialog = function() {
		$scope.dialogType = 'Add';
		showDialog();
	}

	var original;
	$scope.showUpdateUserDialog = function(index) {
		$scope.dialogType = 'Edit';
		original = $scope.users[index];
		$scope.currentUser = angular.copy($scope.users[index]);
		showDialog();
	}

	$scope.userAction = function() {
		if(!$scope.currentUser.first_name && !$scope.currentUser.email && !$scope.currentUser.user_role) {
			return;
		}
		if($scope.dialogType == 'Add') {
			var payload = {
				first_name : $scope.currentUser.first_name,
				email : $scope.currentUser.email,
				user_role : $scope.currentUser.user_role,
				branch : $scope.currentUser.branch,
				department : $scope.currentUser.department
			};
			UserService.addUser(payload).then(function(){
				$mdToast.show($mdToast.simple()
				.textContent("User has been Successfully added.")
				.position("top right")
				.hideDelay(5000));
				getUsers();
				$scope.closeDialog();
			}, function(err) {
				if(err.errorCode == 1015) {
					$scope.userForm.email.$error.userExists = true;
					$scope.userForm.email.$invalid = true;
				} else {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to add User.")
					.position("top right")
					.hideDelay(5000));
				}
			});
		} else if($scope.dialogType == 'Edit') {
			var userAction = UserService.editUser;
			var payload = CAService.calculateDiff($scope.currentUser, original);
			if(!angular.equals(payload,{})) {
				UserService.updateUser($scope.currentUser.id, payload).then(function(){
					$mdToast.show($mdToast.simple()
					.textContent("User has been Successfully updated.")
					.position("top right")
					.hideDelay(5000));
					getUsers();
					$scope.closeDialog();
				}, function(err) {
					if(err.errorCode == 1015) {
						$scope.userForm.email.$error.userExists = true;
						$scope.userForm.email.$invalid = true;
					} else {
						$mdToast.show($mdToast.simple()
						.textContent("Unable to update the user.")
						.position("top right")
						.hideDelay(5000));
					}
				});
			}
		}
	}

	$scope.enableUser = function(user) {
		var confirm = $mdDialog.confirm()
	          .title('Enable User - ' + user.first_name)
	          .textContent('Are You sure you want to enable the User?')
	          .ariaLabel('Enable User')
	          .ok('Enable')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	UserService.enableUser(user.id).then(function() {
	    		getUsers();
	    		$mdToast.show($mdToast.simple()
				.textContent("Enabled the User Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in enabling User.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });	
	}

	$scope.showRemoveUserDialog = function(index) {
		var confirm = $mdDialog.confirm()
	          .title('Remove User - ' + $scope.users[index].first_name)
	          .textContent('Are You sure you want to remove the User?')
	          .ariaLabel('Remove User')
	          .ok('Remove')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	UserService.removeUser($scope.users[index].id, index).then(function() {
	    		getUsers();
	    		$mdToast.show($mdToast.simple()
				.textContent("Removed the User Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in removing User.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });	
	}

	$scope.openClient = function(client) {
		$location.path('/documents/' + client.id);
	}

});