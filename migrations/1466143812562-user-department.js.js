'use strict'
var db = require('../db');

exports.up = function(next) {
    var alterQuery = "ALTER TABLE users ADD COLUMN department int(11) NULL, \
    ADD FOREIGN KEY department(department) references departments(id)";
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

exports.down = function(next) {var alterQuery = "ALTER TABLE users DROP COLUMN department, DROP FOREIGN KEY department";
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
