var express = require('express');
app = express();

var port = '12345';
var server = app.listen(port);
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var config = require('./config/config');
var cookieParser = require('cookie-parser');
var db = require('./db');

var connection = db.getConnection().then(function(connection) {
    console.log('Successfully connected to MySQL DB');
    connection.release();
}, function(err){
	console.log("Error in connecting to the DB - " + err);
});

var env = process.env.NODE_ENV || '';
app.set('secret', config.secret);
if('' == env){						// log every request to the console
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());			// pull information from html in POST
	app.use(cookieParser());
	app.use(morgan('dev'));
}

var apiRoutes = express.Router();
require('./app/routes.js')(app, apiRoutes, connection);
app.use('/api',apiRoutes);

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users 

console.log("App listening on the port " + port);
