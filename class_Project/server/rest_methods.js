//new comment

//simple example
var express = require("express");
var mysql = require('mysql');
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : '',
   database : 'ServerDB'
 });
 
var app = express();


app.get("/", function(req,res){
 res.send("hello");
});

//used for the client to retrieve their messages
app.get("/message", function(req, res) {
  
  //if no id is provided end the request  
  if(typeof req.query["username"] === "undefined")
    return res.send("No user id provided");
  
  //execute the query in the db
  var getMessageQuery ="SELECT * FROM messages WHERE receiverName=\""+req.query["username"]+"\";";
  //console.log(getMessageQuery);
  connection.query(getMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send("Error while performing Query.");
    else {
      var jsonArray = new Array();
      //user can have multiple messages waiting for them so create an array to store them all
      for (var i  = 0; i < results.length; i++) {
        //put each message with the users 
        jsonArray[i] = {
          message:results[i]["message"],
          sender:results[i]["username"]
        }  
      }

      var deleteMyMessagesQuery = "DELETE FROM messages WHERE receiverName=\""+req.query["username"]+"\";";
      //console.log(deleteMyMessagesQuery);
      //delete the messages from the database since they are being sent to user
      connection.query(deleteMyMessagesQuery, function(err, results, fields) {
        if(err)
          return res.send("error updating the db");
      });
        
      
      //add method to delete records after reading
      return res.json(jsonArray);
    }
  });  
});

app.listen(8080, 'localhost',function(){
console.log('listening on 8080');

});

/*
table users
userName VARCHAR(30) pk
password VARCHAR(255)

table messages
userName VARCHAR(30)fk
receiverName VARCHAR(30)
message id int auto increment pk
message varchar(500)
*/
