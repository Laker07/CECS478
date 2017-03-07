//new comment

//simple example
var express = require("express");
var mysql = require('mysql');
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : '',
   database : 'tempdb'
 });
 
var app = express();


app.get("/", function(req,res){
 res.send("Hello world!");
});

app.get("/message", function(req, res) {
  
  //if no id is provided cancel the request
  if(typeof req.query["user_id"] === "undefined") {
    res.send("No user id provided");
    return;
  }

  var getMessageQuery ="SELECT * FROM table1 WHERE reciver_id="+req.query["user_id"];
  //execute the query in the db
  connection.query(getMessageQuery, function(err, results, fields) {
    if (err) {
      //error occures exit function
      res.send("Error while performing Query.");
      return;
    }
    else {
      //console.log(results.length);
      var jsonArray = new Array();
      //user can have multiple messages waiting for them so create an array to store them all
      for (var i  = 0; i < results.length; i++) {
        //put each message with the users 
        
        jsonArray[i] = {
          message:results[i]["message"],
          sender:results[i]["sender_id"]
        }  
      }
      //todo create an array and then return it gg ez
      //do lookup for username for who sent the message
      //res.send(jsonArray);
      res.json(jsonArray)
      res.end();
      //res.end
      return;
    }
  });  
});

app.listen(8080, 'localhost',function(){
console.log('listening on 8080');

});

/*

brew services start mysql
  mysql -uroot

CREATE TABLE table1
(
  sender_id       INT unsigned NOT NULL,
  message         VARCHAR(150) NOT NULL,   
  message_id      INT unsigned NOT NULL,
  reciver_id      INT unsigned NOT NULL,          
  PRIMARY KEY     (message_id)
);

INSERT INTO table1 (sender_id, message, message_id, reciver_id) VALUES
(0001, "testmessage1", 00010001, 0002),
(0002, "testmessage2", 00020001, 0001),
(0001, "testmessage3", 00010002, 0002);
*/
