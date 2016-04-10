var migrate = require('migrate');
var set = migrate.load('migration/.migrate', 'migration');
 
set.up(function (err) {
  if (err) throw err;
 
  console.log('Migration completed');
});