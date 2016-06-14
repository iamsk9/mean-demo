Caweb.controller('reportsController', function($scope,$rootScope, CAService, $mdToast, UserService, $location,
	$routeParams, $timeout,$mdpDatePicker) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	//$rootScope.selectedTab = $rootScope.tabsMap['Reports'];
	$scope.task = {};


//	$scope.clientsLoading = false;
	// $scope.branchChanged = function() {
	// 	var payload = {
	// 		branch_id : $scope.task.branch
	// 	};
	// 	UserService.getUsers(payload).then(function(data) {
	// 		delete $scope.task.assignee;
	// 		$scope.employees = data;
	// 	}, function(err) {
	// 		$mdToast.show($mdToast.simple()
	// 		.textContent("Error occurred in getting employees.")
	// 		.position("top right")
	// 		.hideDelay(5000));
	// 	});
	// }
  //   function validateDetails() {
  // 		$scope.assignTaskForm.$setDirty(true);
  // 		$scope.assignTaskForm.$setUntouched(false);
  //		setAllInputsDirty($scope);
  //		return ((($scope.otherClient && $scope.task.clientName && $scope.task.clientName != "" && $scope.task.contactNumber) ||
  // 			(!$scope.otherClient && $scope.task.client)) &&
  //			($scope.task.assignee) &&
  //			($scope.task.description && $scope.task.description != ""))
  //	}
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
	$scope.showDatePicker = function(ev) {
		var date = $scope.task.dateOfStart?moment($scope.task.dateOfStart, 'DD-MM-YYYY').toDate():moment().toDate();
		$mdpDatePicker(date, {
					targetEvent: ev
			}).then(function(selectedDate) {
					$scope.task.dateOfStart= moment(selectedDate).format('DD-MM-YYYY');
			});
	}
	$scope.showDatePick = function(ev) {
		var date = $scope.task.dateOfEnd?moment($scope.task.dateOfEnd, 'DD-MM-YYYY').toDate():moment().toDate();
		$mdpDatePicker(date, {
					targetEvent: ev
			}).then(function(selectedDate) {
					$scope.task.dateOfEnd = moment(selectedDate).format('DD-MM-YYYY');
			});
	}
$scope.generate=function(){
	$scope.views=true;
	$scope.sbranch=$scope.task.branch;
	$scope.semployee=$scope.task.assignee;
	$scope.staskstatus=$scope.task.assigne;
	$scope.staskdateOfStart=$scope.task.dateOfStart;
	$scope.staskdateOfEnd=$scope.task.dateOfEnd;
}
});
