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
			})
			return addClientDefer.promise;
		},

		getClientsService : function(payload) {
			return Restangular.one('/clients').get(payload);
		},

		getClients : function(search) {
			var getClientsDefer = $q.defer();
			var payload = {};
			if(search.companyName && search.companyName !== "") {
				payload.company_name = search.companyName;
			}
			if(search.clientName && search.clientName !== "") {
				payload.client_name = search.clientName;
			}
			if(search.email && search.email !== "") {
				payload.email = search.email;
			}
			if(search.phoneNumber && search.phoneNumber) {
				payload.phone_number = search.phoneNumber;
			}
			if(search.panCardNumber && search.panCardNumber) {
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

		getDocsByClientId : function(id) {
			var docsDefer = $q.defer();
			Restangular.one('client/' + id + '/docs').get().then(function(data) {
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
				if(updated[key] != original[key]) {
					payload[key] = updated[key]; 
				}
			}
			return payload;
		}

	}
});