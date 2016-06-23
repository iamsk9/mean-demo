var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

function sendEmail(id,task,name) {
  var taskName = task;
  var clientName = name;
     var mailQuery = "SELECT email FROM users where id = ? and deleted_at is Null";
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
  }).catch(function(err) {
		   console.log(err);
	   });
}


exports.addFormClient = function(request){
 var addClientFormDefer = q.defer();
 var insertClient = "INSERT INTO clients_enquiry (name, company, email, task, mobile, subject, comment, created_at, modified_at ) VALUES (?,?,?,?,?,?,?,?,?)";
  var connection;
			db.getConnection().then(function(conn) {
				  connection=conn;
           return utils.runQuery(connection, insertClient, [request.name,request.company,request.email, request.task, request.mobile, request.subject,
            request.comment, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],true);

			}).then(function(){
				var u_id;
			  var qu="select id from users WHERE user_role=?";
			  utils.runQuery(connection, qu,["admin"],true).then(function(results){
				u_id=results[0].id;
				var insertTask = "INSERT INTO tasks(user_id, task_description, assigned_by) values(?,?,?)";
				utils.runQuery(connection, insertTask,[u_id,request.task,request.name],true).then(function(){
						var notificationsQuery = "INSERT into notifications (user_id, description, is_read, task_id, created_at) VALUES (?,?,?,?,?)";
					  utils.runQuery(connection,notificationsQuery ,[u_id,"new task assigned",0,request.task,moment().format('YYYY-MM-DD HH:mm:ss')],true).then(function() {
								sendEmail(u_id,request.task,request.name);
								addClientFormDefer.resolve();
			      });
				});
			});
			}).catch(function(err) {
				addClientFormDefer.reject(err);
			});
      return addClientFormDefer.promise;
  }
