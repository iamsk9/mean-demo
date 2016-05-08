Caweb.controller('editTaskController', function($scope, $rootScope, $routeParams, CAService, $mdToast, $location, $mdDialog,
	UserService, TaskStatus, $mdpDatePicker, $mdpTimePicker) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Tasks'];
	var originalTask;
	$scope.taskStatus = TaskStatus;
	function updateTaskModel(task){
		originalTask = angular.copy(task);
		$scope.task = task;
		var userId = UserService.getUserDetails().id;
		$scope.docStatus = {};
		for(var i = 0; i < $scope.task.docs.length; i++) {
			$scope.docStatus[$scope.task.docs[i].id] = $scope.task.docs[i];
		}
		if($scope.task.assigned_by == userId) {
			$scope.assigneeEditAccess = true;
		} else {
			$scope.assigneeEditAccess = false;
		}
		$scope.branchChanged();
		if($scope.task.client_id) {
			$scope.selectedClient = {
				id : $scope.task.client_id,
				name : $scope.task.client_name
			};
			$scope.$watch('selectedClient', function() {
				if($scope.selectedClient) {
					$scope.task.client_id = $scope.selectedClient.id;	
				}
			});
			$scope.otherClient = false;
		} else {
			$scope.otherClient = true;
		}
	}
	function getTask() {
		CAService.getTask($routeParams.taskId).then(updateTaskModel, function(err) {
			if(err.errorCode == 1025) {
				$location.path('/tasks');
				return;
			}
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch Task Details")
			.position("top right")
			.hideDelay(5000));
		});
	}
	function getReqDocs() {
		CAService.getReqDocs($routeParams.taskId).then(function(reqDocs) {
			$scope.reqDocs = reqDocs;
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch Document Details")
			.position("top right")
			.hideDelay(5000));
		});
	}
	getTask();
	getReqDocs();
	CAService.getMasterWorks().then(function(masterWorks) {
		$scope.masterWorks = masterWorks;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Unable to fetch master works")
		.position("top right")
		.hideDelay(5000));
	});
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
	$scope.showDatePicker = function(ev) {
		var date = $scope.task.dateOfAppointment?moment($scope.task.dateOfAppointment, 'DD-MM-YYYY').toDate():moment().toDate();
		$mdpDatePicker(date, {
	        targetEvent: ev
	    }).then(function(selectedDate) {
	        $scope.task.date_of_appointment = moment(selectedDate).format('DD-MM-YYYY');
	    });
	}
	$scope.showTimePicker = function(ev) {
		var time = $scope.task.timeOfAppointment?moment($scope.task.timeOfAppointment, 'hh:mm A').toDate():moment().toDate();
		$mdpTimePicker(time, {
			targetEvent: ev
		}).then(function(selectedTime) {
			$scope.task.time_of_appointment = moment(selectedTime).format('hh:mm A');
		})
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
	$scope.toggle = function (item) {
        if($scope.docStatus[item.doc_id].status) {
        	$scope.docStatus[item.doc_id].status = 0;
        } else {
        	$scope.docStatus[item.doc_id].status = 1;
        }
    };
	$scope.back = function() {
		$location.path('/tasks');
	}
	$scope.updateTask = function(goBack) {
		var payload = CAService.getObjectDiff(originalTask, $scope.task);
		console.log(payload);
		if(!angular.equals(payload, {})) {
			$scope.updateTaskLoading = "indeterminate";
			CAService.updateTask($scope.task.id, payload).then(function(data) {
				$mdToast.show($mdToast.simple()
				.textContent("Updated the Task Successfully")
				.position("top right")
				.hideDelay(5000));
				$scope.updateTaskLoading = false;
				if(goBack) {
					$location.path('/task/' + $routeParams.taskId);
				} else {
					updateTaskModel(data);
					getReqDocs();
				}
			}, function(err) {
				$mdToast.show($mdToast.simple()
				.textContent("Unable to update the Task Details.")
				.position("top right")
				.hideDelay(5000));
			});
		} else if(goBack) {
			$location.path('/task/' + $routeParams.taskId);
		}
	}
});