var template = require('swig');

var ClientFormHelper=require('../helpers/clientFormHelper.js');

exports.postClient = function(req,res){
 ClientFormHelper.addFormClient(req.body).then(function(result) {
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
   var tmpl = template.renderFile('public/Enquiry_Form/client_enquiry_form.html');
   res.send(tmpl);
}