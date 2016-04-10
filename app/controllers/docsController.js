var multer = require('multer');

var DocsHelper = require('../helpers/docsHelper');

var config = require('../../config/config');

var request = require('request');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('doc');

exports.uploadDoc = function(req, res) {
    upload(req, res, function(err) {
        if(err) {
            console.log(err);
            res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
            return;
        }
        console.log(req.file);
        DocsHelper.saveDoc(req).then(function(data) {
            res.json({returnCode : "SUCCESS", data : data, errorCode : null})
        }, function(err) {
            console.log(err);
            res.json({returnCode : "FAILURE", data : null, errorCode : 1014})
        });
    })
}


exports.getDocuments = function(req, res) {
    DocsHelper.getDocumentsByClientId(req.params.id).then(function(data) {
        res.json({returnCode : "SUCCESS", data : data, errorCode : null});
    }, function(err) {
        console.log(err);
        res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
    })
}


exports.updateDocument = function(req, res) {
    DocsHelper.updateDocument(req.params.id, req.body.description).then(function(data) {
        res.json({returnCode : "SUCCESS", data : data, errorCode : null});
    }, function(err) {
        console.log(err);
        res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
    })
}

exports.downloadDocument = function(req, res) {
    DocsHelper.downloadDocument(req.params.id, req).then(function(data) {
        var fileName = data.url.split(config.storage.domainName + config.storage.containerName + '/').slice(1);;
        res.setHeader("content-disposition", "attachment; filename='" + fileName + "'");
        console.log(res);
        request(data.url).pipe(res);
    }, function (err) {
        res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
    });
}

exports.deleteDocument = function(req, res) {
    DocsHelper.deleteDocument(req.params.id).then(function(data) {
        res.json({returnCode : "SUCCESS", data : data, errorCode : null});
    }, function(err) {
        console.log(err);
        res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
    })
};

exports.getDocDownloads = function(req, res) {
    DocsHelper.getDocDownloads(req.params.id).then(function(data) {
        res.json({returnCode : "SUCCESS", data : data, errorCode : null});
    }, function(err) {
        console.log(err);
        res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
    })
}