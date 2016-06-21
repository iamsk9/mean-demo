var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

function sendEmail(task,name) {
	var userQuery = "SELECT id FROM master_tasks where task_name = ?";
  var taskName = task;
  var clientName = name;
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, userQuery,[task]);
  	}).then(function(results) {
      taskId = results[0].id;
      db.getConnection().then(function(connection) {
    return utils.runQuery(connection, "SELECT dept_id from departments_tasks where task_id = ? and deleted_at is NULL",[taskId]);
    }).then(function(results) {
     var id = results[0].dept_id;
     var mailQuery = "SELECT email FROM departments where id = ? and deleted_at is Null";
      db.getConnection().then(function(connection) {
        return utils.runQuery(connection, mailQuery,[id]);
      }).then(function(results) {
        
		     if(results.length > 0) {
  			   var queries = results[0];
  			    emailer.send('public/templates/_taskEmail.html', {
  				    task : task,
              name : clientName
  			     }, queries.email,"Task assigned for department");
		     }
	   });
    });
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
      sendEmail(request.task,request.name);
      return addClientFormDefer.promise;
  }

// exports.getClientEnquiryForm= function() {
//   	var getClientFormDefer = q.defer();
    
//     getClientFormDefer.resolve(results);
//   	return getClientFormDefer.promise;
// }
