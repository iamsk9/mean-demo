'use strict'
var db = require('../db');
//okk
exports.up = function(next) {
    var alterQuery = "ALTER TABLE notifications ADD COLUMN client_enquiry_id int(11), ADD FOREIGN KEY (client_enquiry_id) REFERENCES clients_enquiry(id)";
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
  var alterQuery = "ALTER TABLE notifications DROP COLUMN clent_enquiry_id, DROP FOREIGN KEY client_enquiry_id";
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
