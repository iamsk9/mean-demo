var ClientFormHelper=require('../helpers/ClientFormHelper.js');


exports.postClient = function(req,res){
 departmentHelper.addFormClient(req.body).then(function(result) {
        res.json({returnCode : "SUCCESS", data : data, errorCode : null});
    }, function(err) {
        console.log(err);
        if(err.errorCode) {
            res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
        } else {
            res.json({returnCode : "FAILURE", data : null, errorCode : 2016});
        }
    });
}

exports.getClient = function(req,res){
 departmentHelper.getclient(req.body).then(function(result) {
        res.json({returnCode : "SUCCESS", data : data, errorCode : null});
    }, function(err) {
        console.log(err);
        if(err.errorCode) {
            res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
        } else {
            res.json({returnCode : "FAILURE", data : null, errorCode : 2016});
        }
    });
}
