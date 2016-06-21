var kue = require('kue');

var admZip = require('adm-zip');

var azureStorage = require('azure-storage');

var jobs = kue.createQueue();

jobs.process('extractRar', function(job, done) {
	console.log(job.data);
	var zip = new admZip(job.data.file.path);
	zip.extractAllTo('uploads/' + job.data.file.originalname.substr(0, job.data.file.originalname.length - 4), true);
	zip.getEntries().forEach(function(zipEntry) {
		console.log(zipEntry);
		azureStorage.createBlockBlobFromLocalFile('');
	});
	done();
});