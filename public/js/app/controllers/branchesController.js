Caweb.controller('branchesController', function($scope, $rootScope, CAService, $mdToast, $location, $mdDialog,
	UserService) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Branches'];
	function getBranches() {
		CAService.getBranches(true).then(function(branches){
			$scope.branches = branches;
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch branches")
			.position("top right")
			.hideDelay(5000));
		});
	}
	getBranches();
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

	$scope.closeDialog = function() {
		$mdDialog.cancel();
		$scope.currentBranch = {};
	}

	$scope.showAddBranchDialog = function() {
		$scope.dialogType = 'Add';
		showDialog();
	}

	var original;
	$scope.showUpdateBranchDialog = function(index) {
		$scope.dialogType = 'Edit';
		original = $scope.branches[index];
		$scope.currentBranch = angular.copy($scope.branches[index]);
		showDialog();
	}

	$scope.branchAction = function() {
		if(!$scope.currentBranch.name && !$scope.currentBranch.address && !$scope.currentBranch.office_landline) {
			return;
		}
		if($scope.dialogType == 'Add') {
			var payload = {
				name : $scope.currentBranch.name,
				address : $scope.currentBranch.address,
				office_landline : $scope.currentBranch.office_landline
			};
			CAService.createBranch(payload).then(function(){
				$mdToast.show($mdToast.simple()
				.textContent("Branch has been Successfully added.")
				.position("top right")
				.hideDelay(5000));
				getBranches();
				$scope.closeDialog();
			}, function(err) {
				$mdToast.show($mdToast.simple()
				.textContent("Unable to add Branch.")
				.position("top right")
				.hideDelay(5000));
			});
		} else if($scope.dialogType == 'Edit') {
			var branchAction = CAService.editUser;
			var payload = CAService.calculateDiff($scope.currentBranch, original);
			if(!angular.equals(payload,{})) {
				CAService.updateBranch($scope.currentBranch.id, payload).then(function(){
					$mdToast.show($mdToast.simple()
					.textContent("Branch has been Successfully updated.")
					.position("top right")
					.hideDelay(5000));
					getBranches();
					$scope.closeDialog();
				}, function(err) {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to update the branch.")
					.position("top right")
					.hideDelay(5000));
				});
			}
		}
	}

	$scope.enableBranch = function(branch) {
		var confirm = $mdDialog.confirm()
	          .title('Enable Branch - ' + branch.name)
	          .textContent('Are You sure you want to enable the Branch?')
	          .ariaLabel('Enable Branch')
	          .ok('Enable')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	CAService.enableBranch(branch.id).then(function() {
	    		getBranches();
	    		$mdToast.show($mdToast.simple()
				.textContent("Enabled the Branch Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in enabling Branch.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });
	}

	$scope.showRemoveBranchDialog = function(index) {
		var confirm = $mdDialog.confirm()
	          .title('Disable Branch - ' + $scope.branches[index].name)
	          .textContent('Are You sure you want to disable the Branch?')
	          .ariaLabel('Disable Branch')
	          .ok('Disable')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	CAService.removeBranch($scope.branches[index].id, index).then(function() {
	    		getBranches();
	    		$mdToast.show($mdToast.simple()
				.textContent("Disabled the Branch Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in disabling the Branch.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });	
	}
});