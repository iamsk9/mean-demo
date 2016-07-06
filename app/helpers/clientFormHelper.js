var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

var emailer = require('../emailer');

var q = require('q');

var taskName;

function sendEmail(id, name, email, company, task, mobile, subject, comment) {
    var sendEmailDefer = q.defer();
    var userQuery = "SELECT dept_id from departments_tasks where task_id = ? and deleted_at is NULL";
    var taskQuery = "SELECT task_name from master_tasks where id = ? and deleted_at is NULL";
    var connect;
    var taskName;
    var mailToAdmin = "SELECT email FROM users where id = ? and deleted_at is Null";
    db.getConnection().then(function(connection) {
        connect = connection;
        return utils.runQuery(connect, taskQuery, [task], true);
    }).then(function(results) {
        taskName = results[0].task_name;
        return utils.runQuery(connect, mailToAdmin, [id], true);
    }).then(function(results) {
        if (results.length > 0) {
            var queries = results[0];
            emailer.send('public/templates/_taskEmail.html', {
                name: name,
                company: company,
                email: email,
                task: taskName,
                subject: subject,
                comment: comment,
                mobile: mobile
            }, queries.email, "Task assigned for department");
        }
    }).then(function() {
      sendEmailDefer.resolve();
    }).catch(function(err) {
        console.log(err);
        sendEmailDefer.reject();
    });
    return sendEmailDefer.promise;
}

function sendNotification(connection, params, release) {
    var notificationsQuery = "INSERT into notifications (user_id, description, is_read, created_at,client_enquiry_id) VALUES (?,?,?,?,?)";
    return utils.runQuery(connection, notificationsQuery, [params.user_id, params.description, params.is_read, moment().format('YYYY-MM-DD HH:mm:ss'), params.client_enquiry_id], !release);
}

exports.addFormClient = function(request) {
    var addClientFormDefer = q.defer();
    var conn;
    var selectedTask, taskName;
    var insertClient = "INSERT INTO clients_enquiry (name, company, email, task, mobile, subject, comment, created_at, modified_at ) VALUES (?,?,?,?,?,?,?,?,?)";
    var clientEnquiryId;
    db.getConnection().then(function(connection) {
        conn = connection;
        return utils.runQuery(conn, insertClient, [request.name, request.company, request.email, request.task, request.mobile, request.subject,
            request.comment, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')
        ], true);
    }).then(function(clientEnquiry) {
        var u_id;
        var qu = "select id from users WHERE user_role=?";
        console.log(clientEnquiry.insertId);
        clientEnquiryId = clientEnquiry.insertId;
        return utils.runQuery(conn, qu, ["admin"], true)
    }).then(function(results) {        
        u_id = results[0].id;
        var taskQuery = "SELECT task_name from master_tasks where id = ? and deleted_at is NULL";
        utils.runQuery(conn,taskQuery,[request.task]).then(function(result){
           taskName = result[0].task_name; 
        return sendNotification(conn, {
            user_id: u_id,
            description: "New Client"+" : "+request.name+" - " + " Requested for a task"+" : "+taskName,
            is_read : 0,
            client_enquiry_id : clientEnquiryId
        });
      });
    }).then(function() {
        sendEmail(u_id, request.name, request.email, request.company, request.task, request.mobile, request.subject, request.comment);
        var deptQuery = "SELECT d.email from departments_tasks dt Inner join departments d on dt.dept_id = d.id where dt.task_id = ? and dt.deleted_at = NULL and d.deleted_at = NULL";
        return utils.runQuery(conn, deptQuery, [request.task], true);
    }).then(function(results) {
        console.log(results[0].email+"");
        if(results.length > 0) {
            emailer.send('public/templates/_taskEmail.html', {
                name: request.name,
                company: request.company,
                email: request.email,
                task: request.task,
                mobile: request.mobile,
                subject : request.subject,
                comment : request.comment
            }, results[0].email, "Task assigned for department");   
        }
        emailer.send('public/templates/_thanks.html', {
            name : request.name
        }, request.email, "Thank You");
        addClientFormDefer.resolve();
    }).catch(function(err) {
        addClientFormDefer.reject(err);
    });
    return addClientFormDefer.promise;
}
