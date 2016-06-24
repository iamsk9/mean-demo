Caweb.controller('departmentsController', function($scope, $rootScope, CAService, $mdToast, $location, $mdDialog,
	UserService) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Master Management'];
	$scope.task_works = [];
	$scope.deptTasks = [];
	$scope.newly_added_tasks = [];
	$scope.removed_tasks = [];
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

	 function showWorkDialog(){
 		$mdDialog.show({
 	    	controller : function($scope, theScope) {
 	    		$scope.theScope = theScope
 	    		$scope.$watch('workForm', function() {
 	    			$scope.theScope.workForm = $scope.workForm;
 	    		}, true);
 	    	},
 			templateUrl : 'work.tmpl.html',
 			parent : angular.element(document.body),
 			clickOutsideToClose:true,
 			locals : {
 				theScope : $scope
 			}
 	 	}).then(function(){
           });
    }

   function showTaskDialog(){
		$mdDialog.show({
	    	controller : function($scope, theScope) {
	    		$scope.theScope = theScope;
	    	},
			templateUrl : 'task.tmpl.html',
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
		$scope.task_works = [];
		$scope.currentDepartment = [];
		showDialog();
	}

	$scope.showAddWorkDialog = function() {
		$scope.dialogType = 'Add';
		$scope.task_works = [];
		$scope.currentWork = [];
		showWorkDialog();
	}

	var original;
	$scope.showUpdateDepartmentDialog = function(index) {
		var id = $scope.departments[index].id;
		$scope.dialogType = 'Edit';
		$scope.newly_added_tasks = [];
	    $scope.removed_tasks = [];
		CAService.getTaskList(id).then(function(result){
       	    $scope.task_works = result;
        },function(err){
        	$mdToast.show($mdToast.simple()
       	              .textContent("not working")
       	              .position("top right")
       	              .hideDelay(5000));
        });
		original = $scope.departments[index];
		$scope.currentDepartment = angular.copy($scope.departments[index]);
		showDialog();
	}

	var selectedChip = "";

	// $scope.selectedItem = function(chip){
	// 	if(selectedChip === "")
	// 		selectedChip = chip;
	// 	else {
	// 		selectedChip = selectedChip + "-" + chip;
	// 	}
	// }

    $scope.tasksSelected = function(ob,taskId) {
    	            if($scope.dialogType == 'Edit')
    	            {
    	            	 for(var i=0;i<$scope.task_works.length;i++)
		    	            {
		                    	if( $scope.task_works[i].id == taskId)
		    	            		return;
		    	            }
    	            	$scope.newly_added_tasks.push({
    	            	id:taskId,
    	            	name:ob.name
    	                });
    	            }
    	            for(var i=0;i<$scope.task_works.length;i++)
    	            {
                    	if( $scope.task_works[i].id == taskId)
    	            		return;
    	            }
    	            $scope.task_works.push({
    	            	id:taskId,
    	            	name:ob.name
    	            });
   }

	$scope.getTasks = function(id){
       CAService.getTaskList(id).then(function(result){
       	    $scope.deptTasks = result;
        },function(err){
        	$mdToast.show($mdToast.simple()
       	              .textContent("not working")
       	              .position("top right")
       	              .hideDelay(5000));
        });
       showTaskDialog();
    }

    $scope.removeTask = function(id,name){
    	      $scope.removed_tasks.push({
    	            	id: id,
    	            	name: name
    	            });
     //$scope.task_works.splice(id,1);
    }

	$scope.departmentAction = function() {
		if(!$scope.currentDepartment.name && !$scope.currentDepartment.email) {
			return;
		}
		if($scope.dialogType == 'Add') {
			var payload = {
				name : $scope.currentDepartment.name,
	            email : $scope.currentDepartment.email,
	            task :  $scope.task_works
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
			var departmentAction = CAService.editUser;
			var payload = {};
			var updated_details = CAService.calculateDeptDiff($scope.currentDepartment, original);
			payload.details = updated_details;
			payload.added_tasks = $scope.newly_added_tasks;
    		payload.removed_tasks = $scope.removed_tasks;
			if(!angular.equals(payload,{})) {
				CAService.updateDepartment($scope.currentDepartment.id, payload).then(function(){
					$mdToast.show($mdToast.simple()
					.textContent("Successfully updated")
					.position("top right")
					.hideDelay(5000));
					$scope.closeDialog();
                    getDepartments();
				}, function(err) {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to update the department.")
					.position("top right")
					.hideDelay(5000));
				});
			}
		}
	}
	$scope.workAction = function() {
		if(!$scope.currentWork.name) {
			return;
		}
		if($scope.task_works.length > 0)
		if($scope.dialogType == 'Add') {
			var payload = {
							name : $scope.currentWork.name,
	            department : $scope.currentWork.department,
	            task :  $scope.task_works
			};
			CAService.createWork(payload).then(function(){
				$mdToast.show($mdToast.simple()
				.textContent("Work has been Successfully added.")
				.position("top right")
				.hideDelay(5000));
				getDepartments();
				$scope.closeDialog();
			}, function(err) {
				$mdToast.show($mdToast.simple()
				.textContent("Unable to add work`.")
				.position("top right")
				.hideDelay(5000));
			});
		} else if($scope.dialogType == 'Edit') {
			var departmentAction = CAService.editUser;
			var payload = {};
			var updated_details = CAService.calculateDeptDiff($scope.currentWork, original);
			payload.details = updated_details;
			payload.added_tasks = $scope.newly_added_tasks;
    		payload.removed_tasks = $scope.removed_tasks;
			if(!angular.equals(payload,{})) {
				CAService.updateWork($scope.currentWork.id, payload).then(function(){
					$mdToast.show($mdToast.simple()
					.textContent("Successfully updated")
					.position("top right")
					.hideDelay(5000));
					$scope.closeDialog();
                    getWorks();
				}, function(err) {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to update the work.")
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
