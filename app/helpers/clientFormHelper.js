var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

function sendEmail(id) {
	var userQuery = "SELECT email FROM departments  INNER JOIN dept_task_mapping on departments.id=dept_task_mapping.dept_id INNER JOIN tasks on dept_task_mapping.task_id=id";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, userQuery);
	}).then(function(results) {
		if(results.length > 0) {
			var queries = results[0];
			emailer.send('public/templates/_taskEmail.html', {
				tasks : queries.tasklist
			}, queries.email,"Task assigned for department");
		}
	}).catch(function(err) {
		console.log(err);
	});
}
//var d= "SELECT email FROM departments  INNER JOIN dept_task_mapping on departments.id=dept_task_mapping.dept_id INNER JOIN tasks on dept_task_mapping.tasklist=request.tasklist";
exports.addFormClient = function(request){
 var addClientFormDefer = q.defer();
 var insertClient = "INSERT INTO clients_enquiry (id,name,company,email,\
    mobile,tasklist,created_at,deleted_at, modified_at ) VALUES (?,?,?,?,?,?,?,?)";
      db.getConnection().then(function(connection) {
          return utils.runQuery(connection, insertClient, [request.name,request.company, request.email, request.mobile,request.tasklist,
              moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
      }).then(function(results) {
          addClientFormDefer.resolve();
      }).catch(function(err) {
          addClientFormDefer.reject(err);
      });
      sendEmail(request.id);
      return addClientFormDefer.promise;
  }

  exports.getclient= function(params) {
  	var getClientFormDefer = q.defer();
  	if(params.get_deleted) {
  		var query = "SELECT id, name, company, email,mobile,tasklist,deleted_at from clients_enquiry;";
  	} else {
  		var query = "SELECT id, name, company, email,mobile,tasklist from clients_enquiry where deleted_at is NULL";
  	}
  	db.getConnection().then(function(connection) {
  		return utils.runQuery(connection, query);
  	}).then(function(results) {
  		getClientFormDefer.resolve(results);
  	}).catch(function(err) {
  		getClientFormDefer.reject(err);
  	});
  	return getClientFormDefer.promise;
  }
