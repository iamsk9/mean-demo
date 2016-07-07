var config = require('../../config/config');

var azure = require('azure-storage');

var blobService = azure.createBlobService(config.storage.storageAccount, config.storage.storageAccessKey);

var q = require('q');

var db = require('../../db');

var utils = require('../utils');

var moment = require('moment');

var kue = require('kue');

var jobs = kue.createQueue();

const fs = require('fs');

function uploadToAzureStorage(request) {
	var azureUploadDefer = q.defer();
	console.log("Uploading");
	blobService.createBlockBlobFromLocalFile(config.storage.containerName, request.file.filename, request.file.path, function(error, result, response) {
		if(error) {
			azureUploadDefer.reject(error);
			return;
		}
		console.log("upload successful");
		azureUploadDefer.resolve(config.storage.domainName +
			config.storage.containerName + '/' + result);
	});
	return azureUploadDefer.promise;
}

exports.saveDoc = function(request) {
	var saveDocDefer = q.defer();
	console.log(request.file);
	if(request.file.mimetype == "application/zip" || request.file.mimetype == "application/x-rar") {
		var job = jobs.create('extractRar', {
			file : request.file,
			client_id : request.body.client_id,
			user_id : request.user.id,
			parent : request.body.parent
		}).save();
		var zipExtractionIncQuery = "UPDATE clients SET num_of_zip_jobs = num_of_zip_jobs + 1 where id = ?";
		var zipExtractionDecQuery = "UPDATE clients SET num_of_zip_jobs = num_of_zip_jobs - 1 where id = ?";
		db.getConnection().then(function(connection) {
			utils.runQuery(connection, zipExtractionIncQuery, [request.body.client_id], true).then(function(results) {
				job.on('complete', function(data) {
					utils.runQuery(connection, zipExtractionDecQuery, [request.body.client_id]).then(function(results) {
						console.log("Decremented the Number of Zip Jobs in Progress");
						console.log("The file " + request.file.originalname + " has been extracted and files have been uploaded to azure.");
					}, function(err) {
						console.log("Error in Descrementing the Number of Zip Jobs in progress");
						console.log(err);
						console.log("The file " + request.file.originalname + " has been extracted and files have been uploaded to azure.");
					});
				});
				job.on('failed', function() {
					console.log("The file " + request.file.originalname + " extraction job failed.");
				});
				saveDocDefer.resolve();
			}, function(err) {
				console.log("Error in updating the number of jobs in progress");
				saveDocDefer.reject(err);
			});
		}, function(err) {
			saveDocDefer.reject(err);
		});
		return saveDocDefer.promise;
	} else {
		uploadToAzureStorage(request).then(function(url) {
			console.log("Uploaded to azure " + url);
			console.log(request.file.filename);
			console.log(request.body);
			var docsQuery = "INSERT into docs (user_id, client_id, url, created_at, modified_at, description, parent) VALUES (?,?,?,?,?,?,?)";
			db.getConnection().then(function(connection) {
				console.log("Obtained the connection");
				var query = connection.query(docsQuery, [request.user.id, parseInt(request.body.client_id), url,
					moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), request.file.originalname, request.body.parent], function(err, result){
						console.log(request.file.filename);
						console.log("Inside Query");
						if(err) {
							console.log("Query Error");
							saveDocDefer.reject(err);
							connection.release();
							return;
						}
						console.log("Query Successful");
						saveDocDefer.resolve({id : result.insertId, url : url, description: request.file.originalname, 
							created_at : moment().format('YYYY-MM-DD HH:mm:ss')});
						fs.unlink('uploads/'+request.file.filename, function(err) {
	  						if (err) {
								console.log("Could not Delete file from uploads");
							}
	  						console.log('Successfully Deleted file from Uploads');
						});
						connection.release();
					});
				console.log(query.sql);
			}, function() {
				saveDocDefer.reject();
			})
		}, function(err) {
			saveDocDefer.reject(err);
		});
	}
	return saveDocDefer.promise;
}

exports.getDocumentsByClientId = function(id, parent) {
	var documentsDefer = q.defer();
	if(parent) {
		var docsByClientId = "SELECT d.id, d.user_id, d.url, d.created_at, d.description, d.is_directory, d.parent, d.client_id, u.first_name as added_by from docs d LEFT JOIN users u on d.user_id = u.id where d.client_id = ? and d.parent = ? and d.deleted_at is NULL";
	} else {
		var docsByClientId = "SELECT d.id, d.user_id, d.url, d.created_at, d.description, d.is_directory, d.parent, d.client_id, u.first_name as added_by from docs d LEFT JOIN users u on d.user_id = u.id where client_id = ? and d.parent is NULL and d.deleted_at is NULL";
	}
	db.getConnection().then(function(connection) {
		connection.query(docsByClientId, [id, parent], function(err, results) {
			if(err) {
				documentsDefer.reject(err);
				connection.release();
				return;
			}
			documentsDefer.resolve(results);
			connection.release();
		});
	}, function(err) {
		documentsDefer.reject(err);
	});
	return documentsDefer.promise;
}

exports.updateDocument = function(id, description) {
	var updateDefer = q.defer();
	var docUpdate = "UPDATE docs set ";
	if(typeof description != "undefined") {
		docUpdate = docUpdate + ("description = ?, modified_at = ? where id = ?");
		db.getConnection().then(function(connection) {
			var query = connection.query(docUpdate, [description, moment().format('YYYY-MM-DD HH:mm:ss'), id], function(err, results) {
				if(err) {
					updateDefer.reject(err);
					connection.release();
					return;
				}
				updateDefer.resolve(results);
				connection.release();
			});
			console.log(query.sql);
		}, function(err) {
			updateDefer.reject(err);
		});
	} else {
		updateDefer.reject();
	}
	return updateDefer.promise;
}

function updateCountIfClient(connection, id, req) {
	var updateCountDefer = q.defer();
	if(req.user.role == "CLIENT") {
		var clientDocs = "INSERT into client_downloads (doc_id, downloaded_at) VALUES (?,?)";
		connection.query(clientDocs, [id, moment().format('YYYY-MM-DD HH:mm:ss')], function(err, results) {
			if(err) {
				updateCountDefer.reject(err)
				return;
			}
			updateCountDefer.resolve();
		});
	} else {
		updateCountDefer.resolve();
	}
	return updateCountDefer.promise;
}

exports.downloadDocument = function(id, req) {
	var downloadDefer = q.defer();
	var fetchUrl = "SELECT * from docs where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		console.log("connection inside");
		updateCountIfClient(connection, id, req).then(function() {
			console.log("askdjgaskdjg");
			connection.query(fetchUrl, [id], function(err, results) {
				if(err) {
					downloadDefer.reject();
					connection.release();
					return;
				}
				if(results.length > 0) {
					downloadDefer.resolve(results[0]);
					connection.release();
				}
			});
		}, function(err) {
			connection.release();
			downloadDefer.reject(err);
		});
	}, function(err) {
		downloadDefer.reject();
	});
	return downloadDefer.promise;
}

exports.deleteDocument = function(id) {
	var deleteDefer = q.defer();
	var getDocument = "SELECT * from docs where id = ?";
	var deleteQuery = "UPDATE docs set deleted_at = ?, modified_at = deleted_at where id = ?";
	var connection;
	db.getConnection().then(function(conn) {
		connection = conn;
		return utils.runQuery(connection, getDocument, [id], true);
	}, function(err) {
		deleteDefer.reject(err);
	}).then(function(data) {
		var params;
		if(data[0].is_directory) {
			deleteQuery = deleteQuery + (" or parent = ?");
			params = [moment().format('YYYY-MM-DD HH:mm:ss'), id, id];
		} else {
			params = [moment().format('YYYY-MM-DD HH:mm:ss'), id];
		}
		return utils.runQuery(connection, deleteQuery, params);
	}, function(err) {
		deleteDefer.reject(err);
	}).then(function(result){
		deleteDefer.resolve();
	}, function(err) {
		deleteDefer.reject(err);
	});
	return deleteDefer.promise;
}

exports.getTotalTasks = function(obj) {
	var getTotalTask = q.defer();
	var getTotalTasks = "SELECT count(*) as getTotalTasks from tasks";
	db.getConnection().then(function(connection) {
		connection.query(getTotalTasks, function(err, results){
			if(err) {
				connection.release();
				getTotalTask.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.totalMetrics.getTotalTasks = results[0].getTotalTasks;
			} else {
				obj.totalMetrics.getTotalTasks = 0;
			}
			connection.release();
			getTotalTask.resolve();
		});
	}, function(err) {
		getTotalTask.reject(err);
	});
	return getTotalTask.promise;
}

exports.getTodaysTasks = function(obj) {
	var getTodaysTask = q.defer();
	var todaystasks = "SELECT count(*) as todaystasks from tasks where DATE(created_at) = DATE(NOW())";
	db.getConnection().then(function(connection) {
		connection.query(todaystasks, function(err, results){
			if(err) {
				connection.release();
				getTodaysTask.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.todaysMetrics.todaystasks = results[0].todaystasks;
			} else {
				obj.todaysMetrics.todaystasks = 0;
			}
			connection.release();
			console.log(results);
			getTodaysTask.resolve();
		});
	}, function(err) {
		getTodaysTask.reject(err);
	});
	return getTodaysTask.promise;
}

exports.getTotalPendingTasks = function(obj) {
	var getTotalPendingTask = q.defer();
	var totalpendingtasks = "SELECT count(*) as totalpendingtasks from tasks where task_status <> 'Completed' and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(totalpendingtasks, function(err, results){
			if(err) {
				connection.release();
				getTotalPendingTask.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.totalMetrics.totalpendingtasks = results[0].totalpendingtasks;
			} else {
				obj.totalMetrics.totalpendingtasks = 0;
			}
			connection.release();
			console.log(results);

			getTotalPendingTask.resolve();
		});
	}, function(err) {
		getTotalPendingTask.reject(err);
	});
	return getTotalPendingTask.promise;
}

exports.getTodaysPendingTasks = function(obj) {
	var getTodaysPendingTask = q.defer();
	var todaypendingtasks = "SELECT count(*) as todaypendingtasks from tasks where task_status <> 'Completed' and DATE(created_at) = DATE(NOW())";
	db.getConnection().then(function(connection) {
		connection.query(todaypendingtasks, function(err, results){
			if(err) {
				connection.release();
				getTodaysPendingTask.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.todaysMetrics.todaypendingtasks = results[0].todaypendingtasks;
			} else {
				obj.todaysMetrics.todaypendingtasks = 0;
			}
			connection.release();

			getTodaysPendingTask.resolve();
		});
	}, function(err) {
		getTodaysPendingTask.reject(err);
	});
	return getTodaysPendingTask.promise;
}

exports.getDocDownloads = function(id) {
	var getDocDownloads = q.defer();
	var query = 'SELECT b.id, max(a.downloaded_at) as latestDownloadedTime, b.client_id, b.description, b.url, count(downloaded_at) as downloadCount\
	from docs b LEFT OUTER JOIN client_downloads a on a.doc_id = b.id where b.client_id = ? and b.deleted_at is NULL and b.is_directory = ? group by b.id'
	db.getConnection().then(function(connection) {
		console.log(id);
		var sql = connection.query(query, [id, 0], function(err, results) {
			if(err) {
				connection.release();
				docDownloadsDefer.reject(err);
				return;
			}
			connection.release();
			console.log(results);
			docDownloadsDefer.resolve(results);
		});
		console.log(sql.sql);
	}, function(err) {
		docDownloadsDefer.reject(err);
	});
	return docDownloadsDefer.promise;
}

exports.createDirectory = function(user, params) {
	var createDirectoryDefer = q.defer();
	var query = 'INSERT into docs (user_id, url, created_at, modified_at, client_id, is_directory, parent, description) \
	VALUES (?,?,?,?,?,?,?,?)';
	db.getConnection().then(function(connection) {
		var values = {
			user_id : user.id,
			url : params.path,
			created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
			modified_at : moment().format('YYYY-MM-DD HH:mm:ss'),
			client_id : params.client_id,
			is_directory : 1,
			parent : params.parent,
			description : params.name
		};
		console.log("inside connection");
		console.log(utils);
		utils.runQuery(connection, query, [values.user_id, values.url, values.created_at,
			values.modified_at, values.client_id, values.is_directory, values.parent, values.description]).then(function(results){
			values.id = results.insertId;
			console.log("uakasdjgas");
			createDirectoryDefer.resolve(values);
		}, function(err) {
			createDirectoryDefer.reject(err);
		})
	}, function(err) {
		createDirectoryDefer.reject(err);
	});
	return createDirectoryDefer.promise;
}

exports.getDoc = function(params) {
	var getDocDefer = q.defer();
	var key, obj;
	if(Object.keys(params).length == 0) {
		getDocDefer.resolve();
	} else {
		db.getConnection().then(function(connection) {
			var queryParams = [];
			for(key in params) {
				obj = {};
				obj[key] = params[key];
				queryParams.push(obj);
			}
			var getDocQuery = "SELECT * from docs where ?";
			return utils.runQuery(connection, getDocQuery, queryParams);
		}).then(function(results) {
			getDocDefer.resolve(results);
		}).catch(function(err) {
			getDocDefer.reject(err);
		});
	}
	return getDocDefer.promise;
}
