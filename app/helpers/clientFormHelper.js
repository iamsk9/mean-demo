var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

var selectedTask;

function sendEmail(id,task,name,email,company,task,mobile) {
 var sendEmailDefer = q.defer();
 var userQuery = "SELECT dept_id from departments_tasks where task_id = ? and deleted_at is NULL";

    var mailQuery = "SELECT email FROM users where id = ? and deleted_at is Null";
     db.getConnection().then(function(connection) {
       return utils.runQuery(connection, mailQuery,[id]);
     }).then(function(results) {

             if(results.length > 0) {
                 var queries = results[0];
                 emailer.send('public/templates/_taskEmail.html', {
                   task : selectedTask,
                   name : name,
                   company : company,
                   email : email,
                   task : task,
                   mobile : mobile
                  }, queries.email,"Task assigned for department");
             }
         sendEmailDefer.resolve();
 }).catch(function(err) {
      console.log(err);
      sendEmailDefer.reject();
 });
return sendEmailDefer.promise;
}

exports.addFormClient = function(request){
 var addClientFormDefer = q.defer();
 var conn;
 var selectedTask;
 var insertClient = "INSERT INTO clients_enquiry (name, company, email, task, mobile, subject, comment, created_at, modified_at ) VALUES (?,?,?,?,?,?,?,?,?)";
      db.getConnection().then(function(connection) {
          conn = connection;
          return utils.runQuery(connection, insertClient, [request.name,request.company,request.email, request.task, request.mobile, request.subject,
            request.comment, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
      }).then(function() {
            var u_id;
                var qu="select id from users WHERE user_role=?";
                utils.runQuery(conn, qu,["admin"],true).then(function(results){
                u_id=results[0].id;
                var insertTask = "INSERT INTO tasks(user_id, task_description, assigned_by) values(?,?,?)";
                utils.runQuery(conn, insertTask,[u_id,request.task,request.name],true).then(function(){
                        var notificationsQuery = "INSERT into notifications (user_id, description, is_read, task_id, created_at) VALUES (?,?,?,?,?)";
                        utils.runQuery(conn,notificationsQuery ,[u_id,"new task assigned",0,request.task,moment().format('YYYY-MM-DD HH:mm:ss')],true).then(function() {
                                console.log(request.check);
                                var getTask="select task_name from master_tasks where id = ?";
                                utils.runQuery(conn, getTask,[u_id],true).then(function(task){

                                   selectedTask = task[0].task_name;
                                   console.log(selectedTask);
                                });
                                if(request.check == "yes"){
                                    //console.log("email sent to client");
                                    emailer.send('public/templates/_clientRegistrationDetailsEmail.html', {
                                      name : request.name,
                                      company : request.company,
                                      email : request.email,
                                      task : request.task,
                                      mobile : request.mobile
                                    }, request.email,"registration details");
                                }
                                sendEmail(u_id,selectedTask,request.name,request.email,request.company,request.task,request.mobile);
                                addClientFormDefer.resolve();
                        });
                });
            });
         },function(){
          console.log("error in return function");
          addClientFormDefer.reject(err);
         });
      return addClientFormDefer.promise;
  }
