Caweb.controller('assignTaskController', function($scope, $rootScope, CAService, $mdToast, UserService, $timeout,$location,
	$mdpDatePicker, $mdpTimePicker, $routeParams) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Assign Task'];
	$rootScope.taskAssignedThroughNotification=0;
	$scope.reset = true;
	$scope.task = {};
	$scope.currentClient = {};
	$scope.task.works = [];
	if($routeParams.client_name && $routeParams.mobile) {
		$rootScope.taskAssignedThroughNotification=1;
		$scope.otherClient = true;
		$scope.task.clientName = $routeParams.client_name;
		$scope.task.contactNumber = $routeParams.mobile;
		$scope.task.client_enquiry_id = $routeParams.client_enquiry_id;
		$scope.task.comment = $routeParams.comments;
		CAService.getClientEnquiryDetails($routeParams.client_enquiry_id).then(function(result){
            $scope.task.clientEmail = result.email;
            $scope.task.works = [{ id : result.task, name : result.task_name }];
		},function(){
            $mdToast.show($mdToast.simple()
					.textContent("Error in getting client details")
					.position("top right")
					.hideDelay(5000));
        });
	}

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
				$scope.otherClient = false;
				$scope.assignTaskForm.$setPristine(true);
				$scope.assignTaskForm.$setDirty(false);
				$scope.assignTaskForm.$setUntouched(true);
				$location.search({client_name : NULL, mobile : NULL, client_enquiry_id : NULL,comments : NULL});
				$location.path('/assigntask');
			}, function(err) {
				$scope.assignTaskLoading = false;
				$mdToast.show($mdToast.simple()
				.textContent("Error occurred in assigning task.")
				.position("top right")
				.hideDelay(5000));
			});
		}
		$location.path('/assigntask');
	}
	CAService.getBranches().then(function(data) {
		$scope.branches = data;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Error occurred in getting Branches.")
		.position("top right")
		.hideDelay(5000));
	});
	CAService.getMasterWorks().then(function(masterWorks) {
		$scope.masterWorks = masterWorks;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Unable to fetch master works")
		.position("top right")
		.hideDelay(5000));
	});
	$scope.querySearch = function(searchText) {
		   return CAService.searchClients(searchText);
	}

    $scope.filterResults = function(query) {
		if(query) {
			var results = $scope.masterWorks.filter(createFilterFor(query));
		} else {
			var results = $scope.masterWorks;
		}
      return results;
	}
	function createFilterFor(query) {
      	var lowercaseQuery = angular.lowercase(query);
		return function filterFn(work) {
			return (work.name.toLowerCase().indexOf(lowercaseQuery) > 0);
		};
    }

	$scope.clientTypeChanged = function() {
		if($scope.otherClient) {
			delete $scope.task['client'];
		  } else {
		  	$scope.currentClient.name = item.name;
		  	$scope.otherClient = true;
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
	$scope.selectedClientChanged = function(client){
		$scope.currentClient = client;
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
