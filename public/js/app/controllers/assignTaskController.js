Caweb.controller('assignTaskController', function($scope, $rootScope, CAService, $mdToast, UserService, $timeout,
	$mdpDatePicker, $mdpTimePicker) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Assign Task'];
	$scope.reset = true;
	$scope.task = {};
	$scope.assignTask = function() {
		if(validateDetails()) {
			$scope.assignTaskForm.$setPristine();
			$scope.assignTaskLoading = "indeterminate";
			CAService.assignTask($scope.task).then(function(){
				$scope.assignTaskLoading = false;
				$mdToast.show($mdToast.simple()
					.textContent("Task has been successfully assigned")
					.position("top right")
					.hideDelay(5000));
				$scope.searchText = null;
				$scope.task = {};
				$scope.reset = false;
				$timeout(function(){
					$scope.reset = true;
				}, 0);
				$scope.assignTaskForm.$setPristine(true);
				$scope.assignTaskForm.$setDirty(false);
				$scope.assignTaskForm.$setUntouched(true);
			}, function(err) {
				$scope.assignTaskLoading = false;
				$mdToast.show($mdToast.simple()
				.textContent("Error occurred in assigning task.")
				.position("top right")
				.hideDelay(5000));
			});
		}
	}
	CAService.getBranches().then(function(data) {
		$scope.branches = data;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Error occurred in getting Branches.")
		.position("top right")
		.hideDelay(5000));
	});
	$scope.querySearch = function(searchText) {
		return CAService.searchClients(searchText);
	}

	$scope.clientTypeChanged = function() {
		if($scope.otherClient) {
			delete $scope.task['client']
		} else {
			delete $scope.task['clientName'];
			delete $scope.task['contactNumber'];
		}
	}

	$scope.branchChanged = function() {
		var payload = {
			branch_id : $scope.task.branch
		};
		UserService.getUsers(payload).then(function(data) {
			delete $scope.task.assignee;
			$scope.employees = data;
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Error occurred in getting employees.")
			.position("top right")
			.hideDelay(5000));
		});
	}
	function setAllInputsDirty(form) {
		angular.forEach(form, function(value, key) {
			if (!value || value.$dirty === undefined) {
		      return;
		    }

		    if (value.$addControl) {
		      return setAllInputsDirty(value);
		    }

		    if (value.$setViewValue) {
		      value.$setDirty(true);
		      value.$setPristine(false);
		      value.$setTouched();
		      value.$setViewValue(value.$viewValue);
		      return;
		    }
		});
	}
	$scope.showDatePicker = function(ev) {
		var date = $scope.task.dateOfAppointment?moment($scope.task.dateOfAppointment, 'DD-MM-YYYY').toDate():moment().toDate();
		$mdpDatePicker(date, {
	        targetEvent: ev
	    }).then(function(selectedDate) {
	        $scope.task.dateOfAppointment = moment(selectedDate).format('DD-MM-YYYY');
	    });
	}
	$scope.showTimePicker = function(ev) {
		var time = $scope.task.timeOfAppointment?moment($scope.task.timeOfAppointment, 'hh:mm A').toDate():moment().toDate();
		$mdpTimePicker(time, {
			targetEvent: ev
		}).then(function(selectedTime) {
			$scope.task.timeOfAppointment = moment(selectedTime).format('hh:mm A');
		})
	}
	function validateDetails() {
		$scope.assignTaskForm.$setDirty(true);
		$scope.assignTaskForm.$setUntouched(false);
		setAllInputsDirty($scope);
		return ((($scope.otherClient && $scope.task.clientName && $scope.task.clientName != "" && $scope.task.contactNumber) ||
			(!$scope.otherClient && $scope.task.client)) &&
			($scope.task.assignee) && 
			($scope.task.description && $scope.task.description != ""))
	}
})