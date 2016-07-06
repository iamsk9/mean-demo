var q = require('q');

var db = require('../../db');

var moment = require('moment');

var config = require('../../config/config');

var utils = require('../utils');

var emailer = require('../emailer');

function sendEmail(user_id, details, connection) {
	var userQuery = "SELECT * from users where id = ?";

		 utils.runQuery(connection, userQuery, [user_id], true).then(function(results) {
		if(results.length > 0) {
			var user = results[0];
			emailer.send('public/templates/_notificationTemplate.html', {
				name : user.first_name,
				url : config.domain + '/#/task/' + details.task_id
			}, user.email, details.description);
		}
	}).catch(function(err) {
		console.log(err);
	});
}

function sendEmailDept(dept_id, details) {
	var query = "SELECT * from departments where id = ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [dept_id]);
	}).then(function(results) {
		if(results.length > 0) {
			var dept = results[0];
			emailer.send('public/templates/_notificationTemplate.html', {
				name : dept.first_name,
				url : config.domain + '/#/task/' + details.task_id
			}, dept.email, details.description);
		}
	}).catch(function(err) {
		console.log(err);
	});
}


exports.assignTask = function(request, user) {
	var assignTaskDefer = q.defer();
	var payload = {
		task_description : request.description,
		user_id : parseInt(request.assignee, 10),
		date_of_appointment : moment(request.dateOfAppointment, 'DD-MM-YYYY').format('YYYY-MM-DD'),
		time_of_appointment : moment(request.timeOfAppointment, 'hh:mm A').format('HH:mm'),
		type_of_appointment : request.typeOfAppointment,
		task_status : "Visit Pending",
		assigned_by : user.id,
		remarks : request.remarks,
		created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
		modified_at : moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var notification = {
		user_id : parseInt(request.assignee, 10),
		created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
		is_read : 0
	};
	var taskWorks = [];     
	if(request.client) {
		console.log(request.client);
		payload.client_id = request.client.id;
		payload.client_name = request.client.name;
		payload.contact_number = request.client.phone_number;
		payload.pan_card = request.client.company_pan_number;
	} else {
		payload.client_name = request.clientName;
		payload.contact_number = request.contactNumber;
	}
	var assignTask = "INSERT INTO tasks SET ?";
	var newNotification = "INSERT INTO notifications SET ?";
	var taskWorksQuery = "INSERT INTO task_works SET ?";
	var connection;
	var Tid;
	db.getConnection().then(function(conn) {
		connection = conn;
		return utils.runQuery(connection, assignTask, payload, true);
	}).then(function(result) {
		Tid = result.insertId;
        for( task in request.works){
			taskWorks = {
				task_id : result.insertId,
				work_id : request.works[task].id,
				created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
				modified_at : moment().format('YYYY-MM-DD HH:mm:ss')
			}
			utils.runQuery(connection, taskWorksQuery, taskWorks, true);
			taskWorks = [];
	    }
	}).then(function() {	
		notification.task_id = Tid;
		notification.description = 'New Task has been assigned - Task #' + notification.task_id;
		if(request.client_enquiry_id)
			notification.client_enquiry_id = request.client_enquiry_id;
		sendEmail(notification.user_id, notification, connection);
		utils.runQuery(connection, newNotification, notification).then(function(){
			var deptQuery = "SELECT dept_id from departments_tasks WHERE task_id = ?";
			return utils.runQuery(conn,deptQuery,[request.task_id]).then(sendEmailDept(res, notifications));
		});
	}).then(function(results) {
		assignTaskDefer.resolve();
	}).catch(function(err) {
		assignTaskDefer.reject(err);
	});
	return assignTaskDefer.promise;
}

exports.updateTask = function(id, requestParams, user) {
	var updateTaskDefer = q.defer();
	var now = moment().format('YYYY-MM-DD HH:mm:ss');
	var taskParams = {};
	var taskParamsList = ['client_id', 'client_name', 'contact_number', 'pan_card',
	'type_of_appointment', 'task_description', 'remarks'];
	var getTaskQuery = "SELECT * from tasks where id = ?";
	var connection;
	db.getConnection().then(function(conn) {
		connection = conn;
		for(var i = 0;i < taskParamsList.length;i++) {
			if(requestParams[taskParamsList[i]]) {
				taskParams[taskParamsList[i]] = requestParams[taskParamsList[i]];
			}
		}
		if(requestParams.date_of_appointment) {
			taskParams[data_of_appointment] = moment(requestParams.date_of_appointment, 'DD-MM-YYYY').format('YYYY-MM-DD');
		}
		console.log(requestParams.time_of_appointment);
		if(requestParams.time_of_appointment) {
			taskParams.time_of_appointment = moment(requestParams.time_of_appointment, 'hh:mm A').format('HH:mm');
		}
		return utils.runQuery(connection, getTaskQuery, [id], true);
	}).then(function(results) {
		var results = results[0];
		function updateTask() {
			console.log(taskParams);
			if(Object.keys(taskParams).length > 0) {
				taskParams.modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
				var params = [taskParams, id];
				var query = "UPDATE tasks SET ? where id = ?";
				utils.runQuery(connection, query, params).then(function() {
					return getTask(id, user);
				}).then(function(results) {
					updateTaskDefer.resolve(results);
				}).catch(function(err) {
					updateTaskDefer.reject(err);
				});
			} else {
				console.log("here");
				getTask(id, user).then(function(results) {
					updateTaskDefer.resolve(results);
				}).catch(function(err) {
					updateTaskDefer.reject(err);
				});
			}
		}
		function updateDocs() {
			var docs = requestParams.docs.updated.concat(requestParams.docs.added);
			var updateTaskStatus = "UPDATE task_document_status SET ? where task_id = ? and doc_id = ? and deleted_at is NULL";
			var queryPromises = [];
			console.log(requestParams.docs);
			for(var i = 0; i < docs.length; i++) {
				var updateTaskStatusParams = [{status : docs[i].status, modified_at : now}, id, docs[i].id];
				console.log(requestParams.docs.updated[i]);
				queryPromises.push(utils.runQuery(connection, updateTaskStatus, updateTaskStatusParams, true));
			}
			q.all(queryPromises).then(updateTask).catch(function(err) {
				updateTaskDefer.reject(err);
			});
		}
		function continueUpdate() {
			var getTaskWorks = "SELECT tw.work_id work_id, mt.task_name as work_name, \
			mtdm.id as doc_id, md.name as doc_name, mtdm.custom_label as label from task_works tw \
			INNER JOIN master_task_document_mapping mtdm ON tw.work_id = mtdm.task_id and mtdm.deleted_at is NULL \
			INNER JOIN master_documents md ON mtdm.req_doc_id = md.id and md.deleted_at is NULL \
			INNER JOIN master_tasks mt ON tw.work_id = mt.id \
			where tw.task_id = ? and tw.deleted_at is NULL";
			var getTaskDocs = "SELECT tds.id, tds.task_id, tds.doc_id, tds.status from task_document_status tds where task_id = ? and deleted_at is NULL";
			var insertDocs = "INSERT into task_document_status (task_id, doc_id, status, created_at, modified_at) VALUES ?";
			var taskWorks = {};
			var totalDocsReq = {};
			var taskDocs = {};
			utils.runQuery(connection, getTaskWorks, [id], true).then(function(results) {
				for(var i = 0; i < results.length; i++) {
					if(!taskWorks[results[i].work_id]) {
						taskWorks[results[i].work_id] = {};
					}
					taskWorks[results[i].work_id][results[i].doc_id] = results[i];
					if(!totalDocsReq[results[i].doc_id]) {
						totalDocsReq[results[i].doc_id] = true;
					}
				}
				return utils.runQuery(connection, getTaskDocs, [id], true);
			}).then(function(results) {
				var docsToAdd = [];
				for(var i = 0; i < results.length; i++) {
					if(!taskDocs[results[i].doc_id]) {
						taskDocs[results[i].doc_id] = results[i];
					}
				}
				for(var docId in totalDocsReq) {
					if(!taskDocs[docId]) {
						docsToAdd.push([id, docId, 0, now, now]);
					}
				}
				if(docsToAdd.length > 0) {
					utils.runQuery(connection, insertDocs, [docsToAdd], true).then(function() {
						if(requestParams.docs) {
							updateDocs();
						} else {
							updateTask();
						}
					}, function(err) {
						console.log(err);
					})
				} else if(requestParams.docs) {
					updateDocs();
				} else {
					updateTask();
				}
			}, function(err) {
				console.log(err);
			}).catch(function(err) {
				updateTaskDefer.reject(err);
			});
		}
		if(requestParams.user_id) {
			taskParams.user_id = requestParams.user_id;
			var notificationParams = [[results.user_id, "The Task #" + results.id + " has been unassigned.",
			0, results.id, now], [taskParams.user_id, "New Task has been assigned - Task #" + results.id, 0, results.id, now]];
			var notificationsQuery = "INSERT into notifications (user_id, description, is_read, task_id, created_at) \
			VALUES ?";
			utils.runQuery(connection, notificationsQuery, [notificationParams], true).then(function(data) {

			}, function(err) {
				console.log(err);
			});
		}
		if(requestParams.task_status) {
			taskParams.task_status = requestParams.task_status;
			var notificationParams = [[results.assigned_by, "The Status of the Task #" + results.id + " has been updated to " + requestParams.task_status + ".",
			0, results.id, now]];
			var notificationsQuery = "INSERT into notifications (user_id, description, is_read, task_id, created_at) \
			VALUES ?";
			utils.runQuery(connection, notificationsQuery, [notificationParams], true).then(function(data) {

			}, function(err) {
				console.log(err);
			});
		}
		if(requestParams.works) {
			var insertWorks, deleteWorks;
			if(requestParams.works.added && requestParams.works.added.length > 0) {
				insertWorks = "INSERT into task_works (task_id, work_id, created_at, modified_at) VALUES ?"
				var insertWorksParams = [];
				for(var i = 0;i < requestParams.works.added.length; i++) {
					insertWorksParams.push([results.id, requestParams.works.added[i].id, now, now]);
				}
				console.log(insertWorksParams);
			}
			if(requestParams.works.deleted && requestParams.works.deleted.length > 0) {
				deleteWorks = "UPDATE task_works SET deleted_at = ? where task_id = ? and work_id in ? and deleted_at is NULL";
				var deleteWorksParams = [now, results.id, [[]]];
				for(var i = 0;i < requestParams.works.deleted.length; i++) {
					deleteWorksParams[2][0].push(requestParams.works.deleted[i].id);
				}
			}
			if(insertWorks) {
				utils.runQuery(connection, insertWorks, [insertWorksParams], true).then(function() {
					if(deleteWorks) {
						utils.runQuery(connection, deleteWorks, deleteWorksParams, true).then(continueUpdate);
					} else {
						continueUpdate();
					}
				}).catch(function(err) {
					updateTaskDefer.reject(err);
				});
			} else if(deleteWorks) {
				utils.runQuery(connection, deleteWorks, deleteWorksParams, true).then(continueUpdate).catch(function(err) {
					updateTaskDefer.reject(err);
				});
			}
		} else if(requestParams.docs){
			updateDocs();
		} else {
			updateTask();
		}
	}).catch(function(err) {
		updateTaskDefer.reject(err);
	});
	return updateTaskDefer.promise;
}

exports.getTasks = function(user) {
	var getTasksDefer = q.defer();
	var query = "SELECT t.id, t.client_id, t.client_name, t.contact_number, t.pan_card, t.user_id, t.task_description, t.date_of_appointment, t.time_of_appointment, t.task_status, t.remarks, c.name as primary_client_name, c.phone_number as client_contact_number, c.company_pan_number as client_pan_card, t.assigned_by, u.first_name as assigned_by_name\
	from tasks t LEFT JOIN clients c on t.client_id = c.id\
	 INNER JOIN users u on t.assigned_by = u.id \
	 where (t.user_id = ? or t.assigned_by = ? ) and t.deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [user.id, user.id]);
	}).then(function(results) {
		results.map(function(e) {
			console.log(e);
			if(e.client_id) {
				e.client_name = e.primary_client_name;
				e.contact_number = e.client_contact_number;
				e.pan_card = e.client_pan_card;
			}
			delete e.primary_client_name;
			delete e.client_contact_number;
			delete e.client_pan_card;
			e.date_of_appointment = moment(e.date_of_appointment).format('DD-MM-YYYY');
			e.time_of_appointment = moment(e.time_of_appointment, 'HH:mm').format('hh:mm A');
			return e;
		});
		getTasksDefer.resolve(results);
	}).catch(function(err) {
		getTasksDefer.reject(err);
	});
	return getTasksDefer.promise;
}

var getTask = function(id, user) {
	var getTaskDefer = q.defer();
	var query = "SELECT t.id, t.client_id, t.client_name, t.contact_number, t.pan_card, t.user_id, \
	t.task_description, t.date_of_appointment, t.time_of_appointment, t.type_of_appointment, t.task_status, t.remarks,\
	c.name as primary_client_name, c.phone_number as client_contact_number, c.company_pan_number as client_pan_card\
	, t.assigned_by, au.first_name as assigned_by_name, uu.first_name as user_name, uu.branch as branch, tw.work_id, mt.task_name as work_name, \
	tds.doc_id, md.name as document_name, mtdm.custom_label as label, tds.status as document_status \
	from tasks t \
	LEFT JOIN task_works tw on t.id = tw.task_id and tw.deleted_at is NULL \
	LEFT JOIN master_tasks mt on tw.work_id = mt.id and mt.deleted_at is NULL \
	LEFT JOIN task_document_status tds on t.id = tds.task_id and tds.deleted_at is NULL \
	LEFT JOIN master_task_document_mapping mtdm on tds.doc_id = mtdm.id and mtdm.deleted_at is NULL\
	LEFT JOIN master_documents md on mtdm.req_doc_id = md.id and md.deleted_at is NULL\
	LEFT JOIN clients c on t.client_id = c.id and c.deleted_at is NULL\
	INNER JOIN users au on t.assigned_by = au.id and au.deleted_at is NULL \
	INNER JOIN users uu on t.user_id = uu.id and uu.deleted_at is NULL \
	where t.id = ? and (t.user_id = ? or t.assigned_by = ? ) and t.deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [id, user.id, user.id]);
	}).then(function(results) {
		if(results.length > 0) {
			var response = {
				id : results[0].id,
				user_id : results[0].user_id,
				client_id : results[0].client_id,
				user_name : results[0].user_name,
				task_description : results[0].task_description,
				date_of_appointment : moment(results[0].date_of_appointment).format('DD-MM-YYYY'),
				time_of_appointment : moment(results[0].time_of_appointment, 'HH:mm').format('hh:mm A'),
				type_of_appointment : results[0].type_of_appointment,
				remarks: results[0].remarks,
				task_status : results[0].task_status,
				assigned_by : results[0].assigned_by,
				assigned_by_name : results[0].assigned_by_name,
				branch : results[0].branch
			};
			if(results[0].client_id) {
				response.client_name = results[0].primary_client_name;
				response.contact_number = results[0].client_contact_number;
				response.pan_card = results[0].client_pan_card;
			} else {
				response.client_name = results[0].client_name;
				response.contact_number = results[0].contact_number;
				response.pan_card = results[0].pan_card;
			}
			response.works = [];
			response.docs = [];
			var worksMap = {};
			results.forEach(function(el, index) {
				if(el.work_id && !worksMap[el.work_id]) {
					worksMap[el.work_id] = true;
					response.works.push({
						id : el.work_id,
						name : el.work_name
					});
				}
				if(el.doc_id) {
					response.docs.push({
						id : el.doc_id,
						name : el.document_name,
						label : el.label,
						status : el.document_status
					})
				}
			});

			getTaskDefer.resolve(response);
		} else {
			getTaskDefer.reject({errorCode : 1025})
		}
	}).catch(function(err) {
		getTaskDefer.reject(err);
	});
	return getTaskDefer.promise;
}
exports.getTask = getTask;

var getReqDocs = function(id) {
	var getReqDocsDefer = q.defer();
	var getReqDocsQuery = "SELECT tw.work_id work_id, mt.task_name as work_name, \
	mtdm.id as doc_id, md.name as doc_name, mtdm.custom_label as label from task_works tw \
	INNER JOIN master_task_document_mapping mtdm ON tw.work_id = mtdm.task_id and mtdm.deleted_at is NULL \
	INNER JOIN master_documents md ON mtdm.req_doc_id = md.id and md.deleted_at is NULL \
	INNER JOIN master_tasks mt ON tw.work_id = mt.id and mt.deleted_at is NULL \
	where tw.task_id = ? and tw.deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getReqDocsQuery, [id]);
	}).then(function(results) {
		getReqDocsDefer.resolve(results);
	}).catch(function(err) {
		getReqDocsDefer.reject(err);
	});
	return getReqDocsDefer.promise;
}

exports.getReqDocs = getReqDocs;

var getTaskDocs = function(taskId) {
	var getTaskDocsDefer = q.defer();
	var getTaskDocsQuery = "SELECT md.name as doc_name, mtdm.id as doc_id, mtdm.custom_label as label, mt.id as work_id, mt.task_name as work_name from master_documents md \
	INNER JOIN master_task_document_mapping mtdm ON mtdm.req_doc_id = md.id \
	INNER JOIN master_tasks mt ON mt.id = mtdm.task_id\
	 where md.deleted_at is NULL and mt.deleted_at is NULL and mtdm.deleted_at is NULL and mt.id = ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getTaskDocsQuery, [taskId]);
	}).then(function(results) {
		console.log(results);
		getTaskDocsDefer.resolve(results);
	}).catch(function(err) {
		getTaskDocsDefer.reject(err);
	});
	return getTaskDocsDefer.promise;
}

exports.getTaskDocs = getTaskDocs;

exports.getMasterTasks = function() {
	var getMasterTasksDefer = q.defer();
	var getMasterTasks = "SELECT id, task_name as name from master_tasks where deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getMasterTasks);
	}).then(function(results) {
		getMasterTasksDefer.resolve(results);
	}).catch(function(err) {
		getMasterTasksDefer.reject(err);
	});
	return getMasterTasksDefer.promise;
}

exports.updateTaskStatus = function(requestParams) {
	var updateTaskStatusDefer = q.defer();
	var now = moment().format('YYYY-MM-DD HH:mm:ss');
	var updateTaskStatusQuery = "UPDATE tasks SET task_status = ? where id = ?";
	var notificationsQuery = "INSERT into notifications (user_id, description, is_read, task_id, created_at) \
		VALUES ?";
	var notificationsParams = [];
	var connection;
	db.getConnection().then(function(conn) {
		connection = conn;
		var promises = [];
		for(var i=0;i<requestParams.tasks.length;i++) {
			var params = [requestParams.tasks[i].task_status, requestParams.tasks[i].task_id];
			notificationsParams.push([requestParams.tasks[i].assigned_by, "The Status of the Task #" + requestParams.tasks[i].task_id + " has been updated to " + requestParams.tasks[i].task_status + ".",
			0, requestParams.tasks[i].task_id, now])
			promises.push(utils.runQuery(connection, updateTaskStatusQuery, params, true));
		}
		return q.all(promises);
	}).then(function(results) {
		return utils.runQuery(connection, notificationsQuery, [notificationsParams]);
	}).then(function(results){
		updateTaskStatusDefer.resolve(results);
	}).catch(function(err) {
		updateTaskStatusDefer.reject(err);
	});
	return updateTaskStatusDefer.promise;
}

exports.removeTask = function(id) {
	var removeTaskDefer = q.defer();
	var now = moment().format('YYYY-MM-DD HH:mm:ss');
	var removeTask = "UPDATE tasks SET deleted_at = ? where id = ? and deleted_at is NULL";
	var getTask = "SELECT * from tasks where id = ? and deleted_at is NULL";
	var connection;
	db.getConnection().then(function(conn) {
		connection = conn;
		return utils.runQuery(connection, getTask, [id], true);
	}).then(function(results) {
		var notificationsQuery = "INSERT into notifications (user_id, description, is_read, task_id, created_at) \
			VALUES (?,?,?,?,?)";
		var notificationsParams = [results[0].user_id, "The Task #" + results.id + " has been removed.",
		0, id, now];
		return utils.runQuery(connection, notificationsQuery, notificationsParams, true);
	}).then(function() {
		return utils.runQuery(connection, removeTask, [now, id]);
	}).then(function() {
		removeTaskDefer.resolve();
	}).catch(function(err) {
		removeTaskDefer.reject(err);
	});
	return removeTaskDefer.promise;
}
