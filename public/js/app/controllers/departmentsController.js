Caweb.controller('departmentsController', function($scope, $rootScope, CAService, $mdToast, $location, $mdDialog,
	UserService) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Departments'];
	$scope.task_works = [];
	function getDepartments() {
		CAService.getDepartments().then(function(departments){
			$scope.departments = departments;
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch departments")
			.position("top right")
			.hideDelay(5000));
		});
	}
	CAService.getMasterWorks().then(function(masterWorks) {
		$scope.masterWorks = masterWorks;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Unable to fetch master works")
		.position("top right")
		.hideDelay(5000));
	});
	getDepartments();
	function filterResults(query) {
		alert("testing");
		if(query) {
			var results = $scope.masterWorks.filter(createFilterFor(query));	
		} else {
			var results = $scope.masterWorks;
		}
	}
	function showDialog(){       
		$mdDialog.show({
	    	controller : function($scope, theScope) {
	    		$scope.theScope = theScope
	    		$scope.$watch('departmentForm', function() {
	    			$scope.theScope.departmentForm = $scope.departmentForm;
	    		}, true);
	    	},
			templateUrl : 'department.tmpl.html',
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
		$scope.currentDepartment = {};
		$scope.currentDepartmentTasks = {}
	}

	$scope.showAddDepartmentDialog = function() {
		$scope.dialogType = 'Add';
		showDialog();
	}

	var original;
	$scope.showUpdateDepartmentDialog = function(index) {
		$scope.dialogType = 'Edit';
		original = $scope.departments[index];
		$scope.currentDepartment = angular.copy($scope.departments[index]);
		showDialog();
	}

	$scope.departmentAction = function() {
		if(!$scope.currentDepartment.name && !$scope.currentDepartment.user && !$scope.currentDepartment.task && !$scope.currentDepartment.email) {
			return;
		}
		if($scope.dialogType == 'Add') {
			var payload = {
				name : $scope.currentDepartment.name,
				head : $scope.currentDepartment.head,
				task : $scope.task_works[0].name,
	            email : $scope.currentDepartment.email			
			};
			CAService.createDepartment(payload).then(function(){
				$mdToast.show($mdToast.simple()
				.textContent("department has been Successfully added.")
				.position("top right")
				.hideDelay(5000));
				getDepartments();
				$scope.closeDialog();
			}, function(err) {
				$mdToast.show($mdToast.simple()
				.textContent("Unable to add department`.")
				.position("top right")
				.hideDelay(5000));
			});
		} else if($scope.dialogType == 'Edit') {
			var branchAction = CAService.editUser;
			//var payload = CAService.calculateDiff($scope.currentDepartment, original);
			var payload = {
				name : $scope.currentDepartment.name,
				head : $scope.currentDepartment.head,
				task : $scope.task_works[0].name,
	            email : $scope.currentDepartment.email			
			};
			if(!angular.equals(payload,{})) {
				CAService.updateDepartment($scope.currentDepartment.id, payload).then(function(){
					$mdToast.show($mdToast.simple()
					.textContent("Successfully updated")
					.position("top right")
					.hideDelay(5000));
					getDepartments();
					$scope.closeDialog();
				}, function(err) {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to update the department.")
					.position("top right")
					.hideDelay(5000));
				});
			}
		}
	}

	$scope.showRemoveDepartmentDialog = function(index) {
		var confirm = $mdDialog.confirm()
	          .title('Remove Department - ' + $scope.departments[index].name)
	          .textContent('Are You sure you want to remove the Branch?')
	          .ariaLabel('Remove Branch')
	          .ok('Remove')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	CAService.removeDepartment($scope.departments[index].id, index).then(function() {
	    		$scope.departments.splice(index,1);
	    		$mdToast.show($mdToast.simple()
				.textContent("Removed the Department Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in removing Department.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });	
	}
});