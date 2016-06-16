var config = require('../../config/config');

var azure = require('azure-storage');

var blobService = azure.createBlobService(config.storage.storageAccount, config.storage.storageAccessKey);

var q = require('q');

var db = require('../../db');

var utils = require('../utils');

var moment = require('moment');

const fs = require('fs');

function uploadToAzureStorage(request) {
	var azureUploadDefer = q.defer();
	blobService.createBlockBlobFromLocalFile(config.storage.containerName, request.file.filename, request.file.path, function(error, result, response) {
		if(error) {
			azureUploadDefer.reject(error);
			return;
		}
		azureUploadDefer.resolve(config.storage.domainName +
			config.storage.containerName + '/' + result);
	});
	return azureUploadDefer.promise;
}

exports.saveDoc = function(request) {
	var saveDocDefer = q.defer();
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
					saveDocDefer.resolve({url : url, description: request.file.originalname});
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
	});
	return saveDocDefer.promise;
}

exports.getDocumentsByClientId = function(id, parent) {
	var documentsDefer = q.defer();
	if(parent) {
		var docsByClientId = "SELECT * from docs where client_id = ? and parent = ? and deleted_at is NULL";
	} else {
		var docsByClientId = "SELECT * from docs where client_id = ? and parent is NULL and deleted_at is NULL";

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

exports.getTotalDownloads = function(obj) {
	var documentDownloadsDefer = q.defer();
	var totalDownloads = "SELECT count(*) as downloadsCount from client_downloads";
	db.getConnection().then(function(connection) {
		connection.query(totalDownloads, function(err, results){
			if(err) {
				connection.release();
				documentDownloadsDefer.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.totalMetrics.downloadsCount = results[0].downloadsCount;
			} else {
				obj.totalMetrics.downloadsCount = 0;
			}
			connection.release();
			documentDownloadsDefer.resolve();
		});
	}, function(err) {
		documentDownloadsDefer.reject(err);
	});
	return documentDownloadsDefer.promise;
}

exports.getTodaysDownloads = function(obj) {
	var documentDownloadsDefer = q.defer();
	var todaysDownloads = "SELECT count(*) as downloadsCount from client_downloads where DATE(downloaded_at) = DATE(NOW())";
	db.getConnection().then(function(connection) {
		connection.query(todaysDownloads, function(err, results){
			if(err) {
				connection.release();
				documentDownloadsDefer.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.todaysMetrics.downloadsCount = results[0].downloadsCount;
			} else {
				obj.todaysMetrics.downloadsCount = 0;
			}
			connection.release();
			console.log(results);
			documentDownloadsDefer.resolve();
		});
	}, function(err) {
		documentDownloadsDefer.reject(err);
	});
	return documentDownloadsDefer.promise;
}

exports.getTotalDocs = function(obj) {
	var docsDefer = q.defer();
	var totalDocsCount = "SELECT count(*) as docsCount from docs where deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(totalDocsCount, function(err, results){
			if(err) {
				connection.release();
				docsDefer.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.totalMetrics.docsCount = results[0].docsCount;
			} else {
				obj.totalMetrics.docsCount = 0;
			}
			connection.release();
			console.log(results);

			docsDefer.resolve();
		});
	}, function(err) {
		docsDefer.reject(err);
	});
	return docsDefer.promise;
}

exports.getTodaysDocs = function(obj) {
	var docsDefer = q.defer();
	var todaysDocsCount = "SELECT count(*) as docsCount from docs where DATE(created_at) = DATE(now()) and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(todaysDocsCount, function(err, results){
			if(err) {
				connection.release();
				docsDefer.reject(err);
				return;
			}
			if(results.length > 0) {
				obj.todaysMetrics.docsCount = results[0].docsCount;
			} else {
				obj.todaysMetrics.docsCount = 0;
			}
			connection.release();

			docsDefer.resolve();
		});
	}, function(err) {
		docsDefer.reject(err);
	});
	return docsDefer.promise;
}

exports.getDocDownloads = function(id) {
	var docDownloadsDefer = q.defer();
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
