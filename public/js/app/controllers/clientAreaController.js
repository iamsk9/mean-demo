Caweb.controller('clientAreaController', function($rootScope, $scope, CAService, $mdToast, $location,
	$routeParams, $mdDialog, $timeout, Upload) {
	$scope.isClient = false;
	if($rootScope.user.role == "CLIENT" && ($routeParams.clientId == undefined || 
		$routeParams.clientId != $rootScope.user.id)) {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	} else if($rootScope.user.role == "CLIENT") {
		$scope.isClient = true;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Client Area'];
	$scope.dropAvailable = true;
	$scope.dragOverClassObj = {accept:'dragover', reject:'dragover-err'}
	$scope.modelOptionsObj = {debounce:100};
	$scope.acceptSelect = 'image/*,application/pdf';
	$scope.validateObj = {size: {max: '20MB', min: '10B'}, height: {max: 12000}, width: {max: 12000}, duration: {max: '5m'}};
	$scope.fileUploading = false;
	$scope.searchText = "";
	if(typeof $routeParams.clientId !== "undefined") {
		if($rootScope.user.role !== "CLIENT") {
			CAService.getClientById($routeParams.clientId).then(function(data){
				$scope.client = data;
				$scope.clientDetails = data;
				$scope.clientSelected = true;
			}, function(err) {
				console.log(err);
				if(typeof err.errorCode != "undefined" && err.errorCode == 1019) {
					$mdToast.show($mdToast.simple()
					.textContent("There is no client with id " + $routeParams.clientId + ". Select a valid Client.")
					.position("top right")
					.hideDelay(5000));
				} else {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to fetch client details")
					.position("top right")
					.hideDelay(5000));
				}
			});

			CAService.getDocsByClientId($routeParams.clientId).then(function(data) {
				$scope.docs = data;
			}, function(err) {
				console.log(err);
				$mdToast.show($mdToast.simple()
					.textContent("Unable to fetch documents of the client")
					.position("top right")
					.hideDelay(5000));
			})
		} else {
			CAService.getClientByUserId($routeParams.clientId).then(function(data) {
				$scope.client = data;
				$scope.clientDetails = data;
				$scope.clientSelected = true;
				console.log($scope.clientDetails);
				CAService.getDocsByClientId(data.id).then(function(data) {
					$scope.docs = data;
				}, function(err) {
					console.log(err);
					$mdToast.show($mdToast.simple()
						.textContent("Unable to fetch documents of the client")
						.position("top right")
						.hideDelay(5000));
				})
			} , function(err) {
				console.log(err);
				if(typeof err.errorCode != "undefined" && err.errorCode == 1019) {
					$mdToast.show($mdToast.simple()
					.textContent("There is no client with id " + $routeParams.clientId + ". Select a valid Client.")
					.position("top right")
					.hideDelay(5000));
				} else {
					$mdToast.show($mdToast.simple()
					.textContent("Unable to fetch client details")
					.position("top right")
					.hideDelay(5000));
				}
			});
		}
	} else {
		$scope.clientSelected = false;
	}

	$scope.querySearch = function(searchText) {
		return CAService.searchClients(searchText);
	}

	$scope.getName = function(item) {
		return "#" + item.id + " - " + item.name;
	}

	$scope.selectedClientChanged = function(client) {
		console.log(client);
		if(client) {
			$timeout(function(){
				$location.path('/clientArea/' + client.id);
			}, 500);
		}
	}

	$scope.closeDialog = function() {
		$mdDialog.cancel();
	}

	$scope.getViewImage = function(doc) {
		console.log('imageCalled');
		if(doc.url.indexOf('.pdf') > -1) {
			return 'images/pdf.png';
		} else if(doc.url.indexOf('.doc') > -1 || doc.url.indexOf('.docx') > -1){
			return 'images/word.ico';
		} else if(doc.url.indexOf('.xls') > -1 || doc.url.indexOf('xlsx') > -1 || 
			doc.url.indexOf('csv') > -1) {
			return 'images/XLS.png';
		} else {
			return doc.url;
		}
	}

	$scope.showEditDialog = function() {
		$scope.editClient = angular.copy($scope.clientDetails);
		$scope.editClientName = $scope.editClient.name;
		if(typeof $scope.editClient.phone_number !== "undefined") {
			$scope.editClient.phone_number = parseInt($scope.editClient.phone_number);
		}
		if(typeof $scope.editClient.alt_phone_number !== "undefined") {
			$scope.editClient.alt_phone_number = parseInt($scope.editClient.alt_phone_number);
		}
		$mdDialog.show({
	    	controller : function($scope, theScope) {
	    		$scope.theScope = theScope
	    		$scope.$watch('editClientForm', function() {
	    			$scope.theScope.editClientForm = $scope.editClientForm;
	    		}, true);
	    	},
			templateUrl : 'editClient.tmpl.html',
			parent : angular.element(document.body),
			clickOutsideToClose:true,
			locals : {
				theScope : $scope
			}
		}).then(function(){
		});
	}

	$scope.updateClient = function() {
		if(($scope.editClient.email == undefined || $scope.editClient.email == "") ||
			($scope.editClient.name == undefined || $scope.editClient.name == "") || 
			($scope.editClient.company_pan_number == undefined || $scope.editClient.company_pan_number == "") ||
			($scope.editClient.company_name == undefined || $scope.editClient.company_name == "") ||
			($scope.editClient.phone_number == undefined || $scope.editClient.phone_number == "")) {
				return;
			} 
		var payload = CAService.getClientValuesChanged($scope.clientDetails.id, $scope.editClient);
		if(angular.equals({}, payload)) {
			$scope.closeDialog();
			return;
		}
		$scope.editLoading = "indeterminate";
		CAService.updateClient($scope.clientDetails.id, payload).then(function(data){
			$scope.editLoading = false;
			$scope.closeDialog();
			$scope.clientDetails = data;
			$mdToast.show($mdToast.simple()
			.textContent("Client Changes are saved.")
			.position("top right")
			.hideDelay(5000));
		}, function(err) {
			console.log(err);
			$scope.editLoading = false;
			if(err.errorCode == 1015) {
				$scope.editClientForm.email.$error.userExists = true;
				$scope.editClientForm.email.$invalid = true;
			} else if(err.errorCode == 1018) {
				$scope.editClientForm.panCard.$error.panCardExists = true;
				$scope.editClientForm.panCard.$invalid = true;
			} else {
				$mdToast.show($mdToast.simple()
				.textContent("Error occurred in adding client.")
				.position("top right")
				.hideDelay(5000));
			}
		});
	}

	$scope.showDescriptionInput = function(index) {
		$scope.docs[index].descriptionInputFlag = true;
	}

	$scope.saveDescription = function(index) {
		if(CAService.isDocDescriptionChanged($scope.clientDetails.id, index, $scope.docs[index].description)) {
			$scope.docs[index].descriptionLoader = 'indeterminate';
			CAService.saveDescription($scope.clientDetails.id, index, $scope.docs[index].description).then(function(data) {
				$scope.docs[index].descriptionLoader = false;
				$scope.docs[index].descriptionInputFlag = false;
				$mdToast.show($mdToast.simple()
				.textContent("Description saved successfully")
				.position("top right")
				.hideDelay(5000));
			}, function(err, previousDescription) {
				$scope.docs[index].descriptionLoader = false;
				$scope.docs[index].descriptionInputFlag = false;
				if(previousDescription != undefined) {
					$scope.docs[index].description = previousDescription;
				} else {
					$scope.docs[index].description = "";
				}
				$mdToast.show($mdToast.simple()
				.textContent("Error in saving Description")
				.position("top right")
				.hideDelay(5000));
			})
		} else {
			$scope.docs[index].descriptionInputFlag = false;
		}
	}

	$scope.openDoc = function(doc) {
		console.log(doc);
		$scope.openDocUrl = doc.url;
		if(doc.url.indexOf('.pdf') > -1) {
			$scope.openImageGallery = false;
			$scope.openPDFGallery = true;
		} else if(doc.url.indexOf('.doc') > -1 || doc.url.indexOf('.docx') > -1 || doc.url.indexOf('.xls') > -1 || doc.url.indexOf('xlsx') > -1 || 
			doc.url.indexOf('csv') > -1){
			$mdToast.show($mdToast.simple()
			.textContent("Doc View for word and excel documents is not available. Will be added Soon.")
			.position("top right")
			.hideDelay(5000));
		} else {
			$scope.openPDFGallery = false;
			$scope.openImageGallery = true;
		}
	}

	$scope.closeGallery = function() {
		$scope.openPDFGallery = false;
		$scope.openImageGallery = false;
	}

	$scope.removeDoc = function(index) {
		var confirm = $mdDialog.confirm()
	          .title('Remove Document - ' + ($scope.docs[index].description?$scope.docs[index].description:''))
	          .textContent('Are You sure you want to remove the document?')
	          .ariaLabel('Remove Document')
	          .ok('Remove')
	          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	CAService.removeDocument($scope.clientDetails.id, index).then(function() {
	    		$scope.docs.splice(index,1);
	    		$mdToast.show($mdToast.simple()
				.textContent("Removed the Document Successfully.")
				.position("top right")
				.hideDelay(5000));
	    	}, function(err) {
	    		$mdToast.show($mdToast.simple()
				.textContent("Error in removing document.")
				.position("top right")
				.hideDelay(5000));
	    	});
	    }, function() {
	    });	
	}

	$scope.$watch('images', function() {
		if($scope.images != null) {
			$scope.upload();
		}
	});

	$scope.upload = function() {
		console.log($scope.images);
		$scope.fileUploading = "indeterminate";
		Upload.upload({
			url : '/api/upload',
			headers : {
				'x-ca-api-token' : apiKey
			},
			data : {doc : $scope.images, client_id : $scope.client.id}
		}).then(function(response) {
			console.log(response);
			$scope.fileUploading = false;
			if(response.data.returnCode == "SUCCESS") {
				CAService.addDocument($scope.clientDetails.id, response.data.data);
				$scope.docs.push(response.data.data);
				$mdToast.show($mdToast.simple()
				.textContent("Image uploaded Successfully")
				.position("top right")
				.hideDelay(5000));
			} else {
				$mdToast.show($mdToast.simple()
				.textContent("Error in uploading image")
				.position("top right")
				.hideDelay(5000));
			}
		}, function(err) {
			$scope.fileUploading = false;
			$mdToast.show($mdToast.simple()
			.textContent("Error in uploading image")
			.position("top right")
			.hideDelay(5000));
		}, function(evt) {
			console.log(evt);
			$scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
		})
	}
});