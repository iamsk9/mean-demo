var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

function sendEmail(task) {
	var userQuery = "SELECT dept_id FROM departments_tasks LEFT JOIN master_tasks on master_tasks.task_name = ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, userQuery,[task]);
  	}).then(function(results) {
     var id = results[0].dept_id;
     var mailQuery = "SELECT email FROM departments where id = ?";
      db.getConnection().then(function(connection) {
        return utils.runQuery(connection, mailQuery,[id]);
      });
    }).then(function(results) {
		if(results.length > 0) {
			var queries = results[0];
			emailer.send('public/templates/_taskEmail.html', {
				tasks : queries.task
			}, queries.email,"Task assigned for department");
		}
	}).catch(function(err) {
		console.log(err);
	});
}
//var d= "SELECT email FROM departments  INNER JOIN dept_task_mapping on departments.id=dept_task_mapping.dept_id INNER JOIN tasks on dept_task_mapping.tasklist=request.tasklist";
exports.addFormClient = function(request){
 var addClientFormDefer = q.defer();
 var insertClient = "INSERT INTO clients_enquiry (name,company,email,mobile,task,created_at, modified_at ) VALUES (?,?,?,?,?,?,?)";
      db.getConnection().then(function(connection) {
          return utils.runQuery(connection, insertClient, [request.name,request.company, request.email, request.mobile,request.task,
              moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
      }).then(function() {
          addClientFormDefer.resolve();
      }).catch(function(err) {
          addClientFormDefer.reject(err);
      });
      sendEmail(request.task);
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
