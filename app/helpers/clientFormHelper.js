var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

var q = require('q');

var selectedTask;

function sendEmail(id,name,email,company,task,mobile) {
 var sendEmailDefer = q.defer();
 var userQuery = "SELECT dept_id from departments_tasks where task_id = ? and deleted_at is NULL";

    var mailToAdmin = "SELECT email FROM users where id = ? and deleted_at is Null";
    var mailToDeptHead = "SELECT email FROM departments where id = ? and deleted_at is Null";
     db.getConnection().then(function(connection) {
       utils.runQuery(connection, mailToAdmin,[id]).then(function(results) {
             if(results.length > 0) {
                 var queries = results[0];
                 emailer.send('public/templates/_taskEmail.html', {
                   name : name,
                   company : company,
                   email : email,
                   task : task,
                   mobile : mobile
                  }, queries.email,"Task assigned for department");
             }
      });
  }).then(function(){
       db.getConnection().then(function(connection) {
         utils.runQuery(connection, mailToDeptHead,[id]).then(function(results) {
             if(results.length > 0) {
                 var queries = results[0];
                 emailer.send('public/templates/_taskEmail.html', {
                   name : name,
                   company : company,
                   email : email,
                   task : task,
                   mobile : mobile
                  }, queries.email,"Task assigned for department");
             }
         sendEmailDefer.resolve();
      });
    });
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
      }).then(function(clientEnquiry) {
          var u_id;
          var qu="select id from users WHERE user_role=?";
          console.log(clientEnquiry.insertId);
          utils.runQuery(conn, qu,["admin"],true).then(function(results){
              u_id=results[0].id;
              var notificationsQuery = "INSERT into notifications (user_id, description, is_read, created_at,client_enquiry_id) VALUES (?,?,?,?,?)";
              utils.runQuery(conn,notificationsQuery ,[u_id,"A New Client Enquiry Form Has Been Submitted.",0,moment().format('YYYY-MM-DD HH:mm:ss'),
                clientEnquiry.insertId],true).then(function() {
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
                sendEmail(u_id,request.name,request.email,request.company,request.task,request.mobile);
                addClientFormDefer.resolve();
              }).catch(function(err) {
                addClientFormDefer.reject(err);
              });
          });
     },function(){
      console.log("error in return function");
      addClientFormDefer.reject(err);
     });
    return addClientFormDefer.promise;
}
