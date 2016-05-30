Caweb.controller('tasksController', function($scope, $rootScope, CAService, $mdToast, $location, $mdDialog,
	UserService, TaskStatus) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$scope.taskStatus = TaskStatus;
	$rootScope.selectedTab = $rootScope.tabsMap['Tasks'];
	$scope.myTasks = [];
	$scope.assignedTasks = [];
	var taskList;
	var originalTasks;
	function getTasks() {
		CAService.getTasks().then(function(tasks){
			var userId = UserService.getUserDetails().id;
			taskList = tasks;
			originalTasks = angular.copy(tasks);
			$scope.myTasks = tasks.filter(function(task) {
				return task.user_id == userId;
			});
			$scope.assignedTasks = tasks.filter(function(task) {
				return task.assigned_by == userId;
			});
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch Tasks")
			.position("top right")
			.hideDelay(5000));
		});
	}
	getTasks();
	function showDialog(){
		$mdDialog.show({
	    	controller : function($scope, theScope) {
	    		$scope.theScope = theScope
	    		$scope.$watch('branchForm', function() {
	    			$scope.theScope.branchForm = $scope.branchForm;
	    		}, true);
	    	},
			templateUrl : 'branch.tmpl.html',
			parent : angular.element(document.body),
			clickOutsideToClose:true,
			locals : {
				theScope : $scope
			}
		}).then(function(){
		});
	}
	$scope.updateTask = function(task) {
		$location.path('/task/' + task.id + "/edit");
	}
	$scope.viewTask = function(task) {
		$location.path('/task/' + task.id);
	}

	$scope.closeDialog = function() {
		$mdDialog.cancel();
		$scope.currentBranch = {};
	}

	$scope.assignNewTask = function() {
		$location.path('/assigntask');
	}

	$scope.updateStatusOfTasks = function() {
		var payload = [];
		$scope.updateStatusLoading = "indeterminate";
		angular.forEach(taskList, function(task, index) {
			if(originalTasks[index].task_status != task.task_status) {
				payload.push({
					task_id : task.id,
					task_status : task.task_status,
					assigned_by : task.assigned_by
				});
			}
		});
		if(payload.length > 0) {
			CAService.updateTaskStatus({tasks : payload}).then(function(data) {
				$scope.updateStatusLoading = false;
				$mdToast.show($mdToast.simple()
				.textContent("Status of the tasks has been updated")
				.position("top right")
				.hideDelay(5000));
			}, function(err) {
				$mdToast.show($mdToast.simple()
				.textContent("Unable to update the status of tasks")
				.position("top right")
				.hideDelay(5000));
			});
		} else {
			$scope.updateStatusLoading = false;
		}
	}

	$scope.showRemoveTaskDialog = function(index) {
		var confirm = $mdDialog.confirm()
	          .title('Remove Task')
	          .textContent('Are You sure you want to remove the Task?')
	          .ariaLabel('Remove Task')
	          .ok('Remove')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	CAService.removeTask($scope.assignedTasks[index].id, index).then(function() {
	    		$scope.assignedTasks.splice(index,1);
	    		$mdToast.show($mdToast.simple()
				.textContent("Removed the Task Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in removing Task.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });	
	}
});