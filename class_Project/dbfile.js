//new comment

//simple example
var express = require("express");
var mysql      = require('mysql');
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'tony',
   password : 'cecs478!!!',
   database : 'chatapp'
 });
 
var app = express();

connection.connect(function(err){
if(!err){
console.log("DB is connected\n\n");
}else{
console.log("Error connecting to DB \n");

}
});

app.get("/", function(req,res){

 connection.query('SELECT * from users', function(err, rows, fields) {
   if (!err){
     console.log('The solution is: ', rows);
  } else{
     console.log('Error while performing Query.');
  }
 });
 
 connection.end();
 res.send("Hello world!");
});

app.listen(8080, 'localhost',function(){
console.log('listening on 8080');

});
