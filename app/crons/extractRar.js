var kue = require('kue');

var config = require('../../config/config.js');

var admZip = require('adm-zip');

var azureStorage = require('azure-storage');

var DocsHelper = require('../helpers/docsHelper');

var blobService = azureStorage.createBlobService(config.storage.storageAccount, config.storage.storageAccessKey);

var jobs = kue.createQueue();

jobs.process('extractRar', function(job, done) {
	console.log(job.data);
	var zip = new admZip(job.data.file.path);
	var extractedFolderName = job.data.file.originalname.substr(0, job.data.file.originalname.length - 4);
	zip.extractAllTo('uploads/' + extractedFolderName, true);
	zip.getEntries().forEach(function(zipEntry) {
		console.log(zipEntry);
		console.log(zipEntry.entryName);
		console.log(zipEntry.isDirectory);
		if(zipEntry.isDirectory) {
			var filePath = zipEntry.entryName.split('/');
			var params = {
				client_id : job.data.client_id,

			}
			db.
		}
		//blobService.createBlockBlobFromLocalFile('');
	});
	done();
});