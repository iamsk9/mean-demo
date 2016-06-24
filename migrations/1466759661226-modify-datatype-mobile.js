'use strict'
var db = require('../db');
//okk
exports.up = function(next) {
    var alterQuery = "ALTER TABLE clients_enquiry MODIFY mobile bigint(11)";
    db.getConnection().then(function(connection){
      connection.query(alterQuery, function(err, results){
        if(err) {
          throw err;
        }
        console.log(alterQuery);
        console.log("SUCCESSFUL");
        next();
  });
}, function(err) {
  throw err;
});

};

exports.down = function(next) {
  var alterQuery = "ALTER TABLE clients_enquiry MODIFY mobile int";
  db.getConnection().then(function(connection){
  connection.query(alterQuery, function(err, results){
    if(err) {
      throw err;
    }
    console.log(alterQuery);
    console.log("SUCCESSFUL");
    next();
  });
}, function(err) {
  throw err;
});

};
