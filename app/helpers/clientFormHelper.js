var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

function sendEmail(task,name) {
	var userQuery = "SELECT dept_id from departments_tasks where task_id = ? and deleted_at is NULL";
  var taskName = task;
  var clientName = name;
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, userQuery,[task]);
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
  }).catch(function(err) {
		   console.log(err);
	   });
}


exports.addFormClient = function(request){
 var addClientFormDefer = q.defer();
 var insertClient = "INSERT INTO clients_enquiry (name, company, email, task, mobile, subject, comment, created_at, modified_at ) VALUES (?,?,?,?,?,?,?,?,?)";
      db.getConnection().then(function(connection) {
          return utils.runQuery(connection, insertClient, [request.name,request.company,request.email, request.task, request.mobile, request.subject,
            request.comment, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
      }).then(function() {
          addClientFormDefer.resolve();
      }).catch(function(err) {
          addClientFormDefer.reject(err);
      });
	//var addClientFormDefer = q.defer();hit the api
	    var u_id;
			var qu="select id from users WHERE user_role=?";
			 db.getConnection().then(function(connection) {
			 return utils.runQuery(connection,qu,["admin"]);
		   }).then(function(results) {
				 console.log(results);
				   u_id=results[0].id;
					 var insertTask = "INSERT INTO tasks(user_id, task_description, assigned_by) values(?,?,?)";
				       db.getConnection().then(function(connection) {
				           return utils.runQuery(connection, insertTask,[u_id,request.task,request.name]);
				       }).then(function() {
				           addClientFormDefer.resolve();
				       }).catch(function(err) {
				           addClientFormDefer.reject(err);
				       });
      // }).catch(function(err) {
          // addClientFormDefer.reject(err);
       });

      //sendEmail(request.task,request.name);
      return addClientFormDefer.promise;
  }
