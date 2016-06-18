Caweb.factory('CAService', function(Restangular, $q){
	var clientCache = {};
	var docsCache = {};
	return {
		addClient : function(clientDetails) {
			var addClientDefer = $q.defer();
			var payload = {
				company_name : clientDetails.companyName,
				client_name : clientDetails.clientName,
				email : clientDetails.email,
				phone_number : clientDetails.phoneNumber,
				company_pan_number : clientDetails.panCardNumber
			}
			if(clientDetails.altPhoneNumber) {
				payload.alt_phone_number = clientDetails.altPhoneNumber;
			}
			Restangular.one('/client').post('', payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					addClientDefer.resolve();
				} else {
					addClientDefer.reject({errorCode : data.errorCode});
				}
			}, function(err) {
				addClientDefer.reject(err);
			});
			return addClientDefer.promise;
		},

		getClientsService : function(payload) {
			return Restangular.one('/clients').get(payload);
		},

		getDepartmentsList : function(){
            var departmentListDefer = $q.defer();
            Restangular.one('/departmentsList').get().then(function(data){
            	if(data.returnCode == "SUCCESS") {
					departmentListDefer.resolve(data.data);
				} else {
					departmentListDefer.reject();
				}
			}, function(err){
				gdepartmentListDefer.reject(err);
			});
			return departmentListDefer.promise;
        },

        getTaskList : function(id){
        	var getTaskListDefer = $q.defer();
        	Restangular.one('/departments/' + id).get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					getTaskListDefer.resolve(data.data);
				} else {
					getTaskListDefer.reject();
				}
			}, function(err){
				getTaskListDefer.reject(err);
			});
			return getTaskListDefer.promise;
        },

		getClients : function(search) {
			var getClientsDefer = $q.defer();
			var payload = {};
			if(search && search.clientId && search.clientId !== "") {
				payload.client_id = search.clientId;
			}
			if(search && search.companyName && search.companyName !== "") {
				payload.company_name = search.companyName;
			}
			if(search && search.clientName && search.clientName !== "") {
				payload.client_name = search.clientName;
			}
			if(search && search.email && search.email !== "") {
				payload.email = search.email;
			}
			if(search && search.phoneNumber) {
				payload.phone_number = search.phoneNumber;
			}
			if(search && search.panCardNumber) {
				payload.company_pan_number = search.panCardNumber;
			}
			this.getClientsService(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					getClientsDefer.resolve(data.data);
				} else {
					getClientsDefer.reject(data);
				}
			}, function(err) {
				getClientsDefer.reject(err);
			});
			return getClientsDefer.promise;
		},

		searchClients : function(searchText) {
			var searchClientsDefer = $q.defer();
			var payload = {
				search_query : searchText
			};
			this.getClientsService(payload).then(function(results){
				searchClientsDefer.resolve(results.data);
				for(i in results.data) {
					clientCache[results.data[i].id] = angular.copy(results.data[i]);
				}
			}, function(err) {
				searchClientsDefer.reject(err);
			});
			return searchClientsDefer.promise;
		},

		getClientById : function(id) {
			var clientDefer = $q.defer();
			if(typeof clientCache[id] !== "undefined") {
				clientDefer.resolve(angular.copy(clientCache[id]));
			} else {
				var payload = {
					client_id : id
				};
				this.getClientsService(payload).then(function(data) {
					if(data.returnCode == "SUCCESS") {
						if(typeof data.data != "undefined" && 
							data.data.length > 0) {
							clientCache[id] = angular.copy(data.data[0]);
							clientDefer.resolve(data.data[0]);
						} else {
							clientDefer.reject({errorCode : 1019})
						}
					} else {
						clientDefer.reject();
					}
				}, function(err) {
					clientDefer.reject(err);
				})
			}
			return clientDefer.promise;
		},

		getClientByUserId : function(id) {
			var clientDefer = $q.defer();
			if(typeof clientCache[id] !== "undefined") {
				clientDefer.resolve(angular.copy(clientCache[id]));
			} else {
				var payload = {
					user_id : id
				};
				this.getClientsService(payload).then(function(data) {
					if(data.returnCode == "SUCCESS") {
						if(typeof data.data != "undefined" && 
							data.data.length > 0) {
							clientCache[id] = angular.copy(data.data[0]);
							clientDefer.resolve(data.data[0]);
						} else {
							clientDefer.reject({errorCode : 1019})
						}
					} else {
						clientDefer.reject();
					}
				}, function(err) {
					clientDefer.reject(err);
				})
			}
			return clientDefer.promise;
		},

		getDocsByClientId : function(id, parent) {
			var docsDefer = $q.defer();
			var payload = {
				parent : parent
			};
			Restangular.one('client/' + id + '/docs').get(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					docsCache[id] = {docs : angular.copy(data.data)};
					docsDefer.resolve(data.data);
				} else {
					docsDefer.reject();
				}
			}, function(err) {
				docsDefer.reject();
			});
			return docsDefer.promise;
		},

		saveDescription : function(clientId, index, description) {
			var saveDescriptionDefer = $q.defer();
			var payload = {
				description : description
			};
			Restangular.one('document/' + docsCache[clientId].docs[index].id).patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					docsCache[clientId].docs[index].description = description;
					saveDescriptionDefer.resolve();
				} else {
					saveDescriptionDefer.reject({errorCode : data.errorCode}, docsCache[clientId].docs[index].description);
				}
			}, function(err) {
				saveDescriptionDefer.reject(err, docsCache[clientId].docs[index].description);
			});
			return saveDescriptionDefer.promise;
		},

		addDocument : function(id, data) {
			if(typeof docsCache[id] == 'undefined') {
				docsCache[id] = {docs : []};
			}
			docsCache[id].docs.push(angular.copy(data));
		},

        getDepartments: function() {
			var departmentsDefer = $q.defer();
			Restangular.one('/departments').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					departmentsDefer.resolve(data.data);
				} else {
					departmentsDefer.reject();
				}
			}, function(err){
				departmentsDefer.reject(err);
			});
			return departmentsDefer.promise;
		},

        createDepartment : function(payload) {
			var createDepartmentDefer = $q.defer();
			Restangular.one('/departments').post('', payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					createDepartmentDefer.resolve(data.data);
				} else {
					createDepartmentDefer.reject(data);
				}
			}, function(err) {
				createDepartmentDefer.reject(err);
			});
			return createDepartmentDefer.promise;
		},    

        removeDepartment : function(id) {
			var removeDepartmentDefer = $q.defer();
			Restangular.one('/departments/' + id).remove().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					removeDepartmentDefer.resolve(data.data);
				} else {
					removeDepartmentDefer.reject(data);
				}
			});
			return removeDepartmentDefer.promise;
		},

        updateDepartment : function(id, payload) {
			var updateDepartmentDefer = $q.defer();
			Restangular.one('/departments/' + id).patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					updateDepartmentDefer.resolve(data);
				} else {
					updateDepartmentDefer.reject(data);
				}
			}, function(err) {
				updateDepartmentDefer.reject(err);
			})
			return updateDepartmentDefer.promise;
		},

		removeDocument : function(clientId, index) {
			var removeDefer = $q.defer();
			Restangular.one('/document/' + docsCache[clientId].docs[index].id).remove().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					docsCache[clientId].docs.splice(index,1);
					removeDefer.resolve();
				} else {
					removeDefer.reject();
				}
			}, function(err) {
				removeDefer.reject(err);
			});
			return removeDefer.promise;
		},

		isDocDescriptionChanged : function(id, index, value) {
			if((docsCache[id].docs[index].description != undefined && 
				docsCache[id].docs[index].description != value) || 
				(docsCache[id].docs[index].description == undefined && value != "")) {
				return true;
			} else {
				return false;
			}
		},

		getClientValuesChanged : function(id, values) {
			var obj = {};
			for(i in values) {
				if(clientCache[id][i] != values[i]) {
					obj[i] = values[i];
				}
			}
			return obj;
		},

		updateClient: function(id, payload) {
			var updateClientDefer = $q.defer();
			Restangular.one('/client/' + id).patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					for(i in payload) {
						clientCache[id][i] = payload[i];
					}
					updateClientDefer.resolve(angular.copy(clientCache[id]));
				} else {
					updateClientDefer.reject(data);
				}
			}, function(err) {
				updateClientDefer.reject(err);
			});
			return updateClientDefer.promise;
		},

		getDashboardDetails : function() {
			var dashboardDefer = $q.defer();
			Restangular.one('/dashboard').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					dashboardDefer.resolve(data.data);
				} else {
					dashboardDefer.reject();
				}
			}, function(err) {
				dashboardDefer.reject(err);
			});
			return dashboardDefer.promise;
		},

		getDocumentCountDetails : function(id) {
			var docDownloadDefer = $q.defer();
			Restangular.one('/docDownloads/' + id).get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					var response = {
						documentsDownload : data.data
					};
					docDownloadDefer.resolve(response);
				} else {
					docDownloadDefer.reject();
				}
			}, function(err) {
				docDownloadDefer.reject(err);
			});
			return docDownloadDefer.promise;
		},

		calculateDiff : function(updated, original) {
			var payload = {};
			for(var key in updated) {
				if(key == "name" || "email"){
	                if(updated[key] != original[key])
				    {
							payload[key] = updated[key]; 
					}
			    }
			}
			return payload;
		},

		createFolder: function(data) {
			var createFolderDefer = $q.defer();
			var payload = {
				parent : data.value,
				path : data.path,
				client_id : data.client_id,
				name : data.name
			};
			Restangular.one('/createDirectory').post('',payload).then(function(data){
				if(data.returnCode == 'SUCCESS') {
					createFolderDefer.resolve(data.data);
				} else {
					createFolderDefer.reject(data);
				}
			}, function(err) {
				createFolderDefer.reject(err);
			});
			return createFolderDefer.promise;
		},

		getBranches: function(getDeleted) {
			var branchesDefer = $q.defer();
			var payload = {};
			if(getDeleted) {
				payload.get_deleted = true;
			} else {
				payload.get_deleted = false;
			}
			Restangular.one('/branches').get(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					branchesDefer.resolve(data.data);
				} else {
					branchesDefer.reject();
				}
			}, function(err){
				branchesDefer.reject(err);
			})
			return branchesDefer.promise;
		},
		createBranch : function(payload) {
			var createBranchDefer = $q.defer();
			Restangular.one('/branches').post('', payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					createBranchDefer.resolve(data.data);
				} else {
					createBranchDefer.reject(data);
				}
			}, function(err) {
				createBranchDefer.reject(err);
			});
			return createBranchDefer.promise;
		},
		removeBranch : function(id) {
			var removeBranchDefer = $q.defer();
			Restangular.one('/branches/' + id).remove().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					removeBranchDefer.resolve(data.data);
				} else {
					removeBranchDefer.reject(data);
				}
			});
			return removeBranchDefer.promise;
		},
		enableBranch : function(id) {
			var enableBranchDefer = $q.defer();
			Restangular.one('/branch/' + id + '/enable').patch().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					enableBranchDefer.resolve(data.data);
				} else {
					enableBranchDefer.reject(data);
				}
			});
			return enableBranchDefer.promise;
		},
		updateBranch : function(id, payload) {
			var updateBranchDefer = $q.defer();
			Restangular.one('/branches/' + id).patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					updateBranchDefer.resolve(data);
				} else {
					updateBranchDefer.reject(data);
				}
			}, function(err) {
				updateBranchDefer.reject(err);
			})
			return updateBranchDefer.promise;
		},
		getTasks : function() {
			var getTasksDefer = $q.defer();
			Restangular.one('/tasks').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					getTasksDefer.resolve(data.data);
				} else {
					getTasksDefer.reject(data);
				}
			}, function(err) {
				getTasksDefer.reject(err);
			});
			return getTasksDefer.promise;
		},
		assignTask : function(payload) {
			var assignTaskDefer = $q.defer();
			Restangular.one('/task').post('', payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					assignTaskDefer.resolve(data);
				} else {
					assignTaskDefer.reject(data);
				}
			}, function(err) {
				assignTaskDefer.reject(err);
			});
			return assignTaskDefer.promise;
		},
		updateTaskStatus : function(payload) {
			var updateTaskStatusDefer = $q.defer();
			Restangular.one('/taskStatus').patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					updateTaskStatusDefer.resolve(data);
				} else {
					updateTaskStatusDefer.reject(data);
				}
			}, function(err) {
				updateTaskStatusDefer.reject(err);
			});
			return updateTaskStatusDefer.promise;
		},
		getTask : function(id) {
			var taskDetailsDefer = $q.defer();
			Restangular.one('/task/' + id).get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					taskDetailsDefer.resolve(data.data);
				} else {
					taskDetailsDefer.reject(data);
				}
			}, function(err) {
				taskDetailsDefer.reject(err);
			});
			return taskDetailsDefer.promise;
		},
		getMasterWorks : function() {
			var masterTasksDefer = $q.defer();
			Restangular.one('/mastertasks').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					masterTasksDefer.resolve(data.data);
				} else {
					masterTasksDefer.reject(data);
				}
			}, function(err) {
				masterTasksDefer.reject(err);
			});
			return masterTasksDefer.promise;
		},
		getObjectDiff : function(original, updated) {
			var payload = {};
			for(var i in updated) {
				if(typeof(updated[i]) == 'object') {
					if(updated[i] instanceof Array) {
						var obj = {};
						obj.added = updated[i].filter(function(el) {
							for(var j=0;j < original[i].length;j++) {
								if(angular.equals(original[i][j], el) || original[i][j].id == el.id) {
									return false;
								}
							};
							return true;
						});
						obj.updated = updated[i].filter(function(el) {
							for(var j = 0;j < original[i].length;j++) {
								if(!angular.equals(original[i][j], el) && original[i][j].id == el.id) {
									return true;
								}
							}
							return false;
						});
						obj.deleted = original[i].filter(function(el) {
							for(var j = 0; j < updated[i].length; j++) {
								if(angular.equals(updated[i][j], el) || updated[i][j].id == el.id) {
									return false;
								}
							}
							return true;
						});
						console.log(obj);
						if(obj.added.length > 0 || obj.deleted.length > 0 || obj.updated.length > 0) {
							payload[i] = obj;
						}
					} else {
						if(angular.equals(updated[i], original[i])) {
							payload[i] = updated[i];
						}
					}
				} else if(updated[i] != original[i]){
					payload[i] = updated[i];
				}
			}
			return payload;
		},
		updateTask : function(id, payload) {
			var updateTaskDefer = $q.defer();
			Restangular.one('/task/' + id).patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					updateTaskDefer.resolve(data.data);	
				} else {
					updateTaskDefer.reject(data);
				}
			}, function(err) {
				updateTaskDefer.reject(err);
			});
			return updateTaskDefer.promise;
		},
		getReqDocs : function(id) {
			var getReqDocsDefer = $q.defer();
			Restangular.one('/task/' + id + '/reqDocs').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					getReqDocsDefer.resolve(data.data);
				} else {
					getReqDocsDefer.reject(data);
				}
			}, function(err) {
				getReqDocsDefer.reject(err);
			});
			return getReqDocsDefer.promise;
		},
		removeTask : function(id) {
			var removeTaskDefer = $q.defer();
			Restangular.one('/task/' + id).remove().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					removeTaskDefer.resolve(data.data);
				} else {
					removeTaskDefer.reject(data);
				}
			});
			return removeTaskDefer.promise;
		},
		getNotifications : function(page) {
			var getNotificationsDefer = $q.defer();
			Restangular.one('/notifications').get({page : page}).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					getNotificationsDefer.resolve(data.data);
				} else {
					getNotificationsDefer.reject(data);
				}
			});
			return getNotificationsDefer.promise;
		},
		markAllNotificationsAsRead : function() {
			var markAllNotificationsAsReadDefer = $q.defer();
			Restangular.one('/notifications/read').patch().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					markAllNotificationsAsReadDefer.resolve(data.data);
				} else {
					markAllNotificationsAsReadDefer.reject(data);
				}
			});
			return markAllNotificationsAsReadDefer.promise;
		},
		markNotificationAsRead : function(id) {
			var markNotificationAsReadDefer = $q.defer();
			Restangular.one('/notifications/read/' + id).patch().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					markNotificationAsReadDefer.resolve(data.data);
				} else {
					markNotificationAsReadDefer.reject(data);
				}
			});
			return markNotificationAsReadDefer.promise;
		},
		getNotificationsCount : function() {
			var getNotificationsCountDefer = $q.defer();
			Restangular.one('/notificationscount').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					getNotificationsCountDefer.resolve(data.data);
				} else {
					getNotificationsCountDefer.reject(data);
				}
			});
			return getNotificationsCountDefer.promise;
		},
		updateClientStatus : function(clientId, status) {
			var updateClientStatusDefer = $q.defer();
			Restangular.one('/client/' + clientId + '/status').patch({status : status}).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					updateClientStatusDefer.resolve(data.data);
				} else {
					updateClientStatusDefer.reject(data);
				}
			});
			return updateClientStatusDefer.promise;
		}

	}
});