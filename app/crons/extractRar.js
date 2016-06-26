var kue = require('kue');

var config = require('../../config/config.js');

var admZip = require('adm-zip');

var azureStorage = require('azure-storage');

var DocsHelper = require('../helpers/docsHelper');

var q = require('q');

var blobService = azureStorage.createBlobService(config.storage.storageAccount, config.storage.storageAccessKey);

var jobs = kue.createQueue();

function getPath(filePath) {
	var path = "";
	for(var i = 0; i < filePath.length -1; i++) {
		path = path + filePath[i] + (i<filePath.length-2 ? "/" : "");
	}
	return path;
}

function popLast(string, delimiter) {
	string = string.split(delimiter);
	string.pop();
	return string.join(delimiter);
}

function getParent(parentPath, filePath, client_id) {
	var path = getPath(filePath);
	url = parentPath.url[parentPath.url.length - 1] == '/'?(parentPath.url + path):
		(parentPath.url + '/' + path);
	return DocsHelper.getDoc({url : url, client_id : parseInt(client_id)})
}

function parseZipEntry(data, parentPath, zipEntry) {
	var url, params, filename, originalName;
	var filePath = zipEntry.entryName.split('/');
	if(filePath[filePath.length - 1] == '') {
		filePath.pop();
		console.log(filePath);
	}
	var parseZipEntryDefer = q.defer();
	if(zipEntry.isDirectory) {
		console.log("Creating the Directory......");
		if(filePath.length > 1) {
			getParent(parentPath, filePath, data.client_id).then(function(results) {
				params = {
					path : results[0].url + '/' + filePath.slice(-1)[0],
					client_id : data.client_id,
					parent : results[0].id,
					name : filePath.slice(-1)[0]
				};
				DocsHelper.createDirectory(data.user_id, params).then(function() {
					console.log("Folder Created");
					parseZipEntryDefer.resolve();
				}, function() {
					console.log("Error in creating a dierectory");
					parseZipEntryDefer.reject();
				});
			}, function() {
				parseZipEntryDefer.reject();
				console.log("Unable to get the Doc with url : " + url);
			});
		} else {
			params = {
				path : parentPath.url + filePath.join('/'),
				client_id : data.client_id,
				parent : parentPath.id,
				name : filePath.slice(-1)[0]
			};
			console.log("Params for creating directory ");
			console.log(params);
			DocsHelper.createDirectory({id : data.user_id}, params).then(function() {
				console.log("Created the directory SuccessFully ")
				parseZipEntryDefer.resolve();
			}, function(err) {
				console.log("Error in Creating Directory");
				parseZipEntryDefer.reject(err);
			});
		}
	} else if(filePath.length > 1) {
		console.log(filePath);
		console.log("Not a Directory.");
		getParent(parentPath, filePath, data.client_id).then(function(results) {
			filename = filePath.slice(-1)[0];
			console.log("Uploading the File - " + filename);
			originalName = popLast(filename, '.');
			params = {
				user : {
					id : data.user_id
				},
				body : {
					client_id : data.client_id,
					parent : results[0].id
				},
				file : {
					originalname : originalName,
					filename : originalName,
					path : 'uploads/' + popLast(data.file.originalname, '.') + '/' + zipEntry.entryName
				}
			};
			DocsHelper.saveDoc(params).then(function() {
				console.log("Uploaded the file " + filename + " to azure and saved.");
				parseZipEntryDefer.resolve();
			}, function(err) {
				console.log("Error in uploading the File");
				parseZipEntryDefer.reject(err);
			});
		}, function() {
			console.log("Unable to get the Doc with url : " + url);
			parseZipEntryDefer.reject(err);
		});
	} else {
		filename = filePath.slice(-1)[0];
		originalName = popLast(filename, '.');
		params = {
			user : {
				id : data.user_id
			},
			body : {
				client_id : data.client_id,
				parent : parentPath.id
			},
			file : {
				originalname : originalName,
				filename : originalName,
				path : 'uploads/' + popLast(data.file.originalname, '.') + '/' + zipEntry.entryName
			}
		};
		DocsHelper.saveDoc(params).then(function() {
			console.log("Uploaded the File " + filename + " to azure and saved");
			parseZipEntryDefer.resolve();
		}, function() {
			console.log("Unable to get the Doc with url : " + url);
			parseZipEntryDefer.reject(err);
		});
	}
	return parseZipEntryDefer.promise;
}

jobs.process('extractRar', function(job, done) {
	console.log(job.data);
	var zip = new admZip(job.data.file.path);
	var parentPath, promise;
	var extractedFolderName = job.data.file.originalname.substr(0, job.data.file.originalname.length - 4);
	zip.extractAllTo('uploads/' + extractedFolderName, true);
	DocsHelper.getDoc({id : job.data.parent}).then(function(results) {
		if(results && results.url) {
			parentPath = results;
		} else {
			parentPath = {
				url : "root/",
				id : null
			};
		}
		var entries = zip.getEntries();
		console.log("Number of Entries - " + entries.length);
		if(entries.length > 0) {
			promise = parseZipEntry(job.data, parentPath, entries[0]);
			console.log(promise);
			for(var i = 1; i < entries.length; i++) {
				if (entries[i].entryName.indexOf("__MACOSX") > -1) {
					continue;
				}
				promise = promise.then(
					(function(iter) {
					return function() {
						console.log("------------------------------------------------------------------");
						console.log("Parsing Zip Entry - " + entries[iter].entryName);
						return parseZipEntry(job.data, parentPath, entries[iter]);
					}
				})(i)
				, (function(iter) {
					return function(err) {
						console.log("Error in Processing - " + entries[iter].entryName);
						console.log(err);
						console.log("------------------------------------------------------------------");
						return parseZipEntry(job.data, parentPath, entries[iter]);
					}
				})(i));
			}
			promise.then(function() {
				done();
				console.log("------------------------------------------------------------------");
				console.log("Job Completed Successfully.");
			}, function(err) {
				console.log("Error in Processing - " + entries[entries.length - 1].entryName)
				console.log(err);
				console.log("------------------------------------------------------------------");
				console.log("Job Completed but some files have not been uploaded");
				done();
			});
		}
	});
});

console.log("Job ExtractRar started and listening ...........");
