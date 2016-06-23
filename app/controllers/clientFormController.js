var template = require('swig');

var ClientFormHelper=require('../helpers/clientFormHelper.js');

exports.postClient = function(req,res){
 ClientFormHelper.addFormClient(req.body).then(function() {
        //console.log("raja");
        //res.JSON({returnCode : "success", data : "user registered successfully", errorCode : null});
        var response = {
            status  : 200,
            success : 'Updated Successfully'
        }
        res.type('json');
        res.end(JSON.stringify(response));
    }, function(err) {
        console.log(err);
        if(err.errorCode) {
            res.json({returnCode : "error", data : null, errorCode : err.errorCode});
        } else {
            res.json({returnCode : "error", data : null, errorCode : 2016});
        }
    });
}

exports.getClient = function(req,res){
   var tmpl = template.renderFile('public/Enquiry_Form/client_enquiry_form.html');
   res.send(tmpl);
}
