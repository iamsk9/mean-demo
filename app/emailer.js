var config = require("../config/config");
var Promise = require("bluebird");
var sendgrid  = require("sendgrid");
var fs = Promise.promisifyAll(require("fs"));
var template = require("swig");

exports.send = function(file, model, recipients, subject) {
	if (!(recipients instanceof Array))
		recipients = [recipients];
	return _render(file, model).then(function(rendered) {
		return Promise.map(recipients, function(recipient) {
			return _send(recipient, subject, rendered);
		});
	});
};

function _render(file, model) {
	return new Promise(function(resolve, reject) {
		template.renderFile(file, model, function(err, output) {
			if(err) {
				reject(err);
				return;
			}
			resolve(output);
		});
	});
}

function _send(emailAddress, subject, html) {
	var emailer = sendgrid.call(this, config.email.sendgridApiKey);
	return new Promise(function(resolve, reject) {
		emailer.send({
			to: emailAddress,
			from: config.email.fromAddress,
			subject: subject,
			html: html
		}, function(err) {
			if (err) reject(new Error(err));
			else resolve();
		});
	});
}