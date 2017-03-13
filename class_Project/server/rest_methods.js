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


 res.send("welcome to cecs.me");
});


//used for adding a new user to db
app.put("/newuser",function(req,res) {
  
  //check that the values were provided
  if((typeof req.query["username"] === "undefined") || (typeof req.query["password"] === "undefined"))
    return res.send("Error with inputs");
  
  var addNewUserQuery = "INSERT INTO users (username, password) VALUES (\"" + req.query["username"] + "\", \"" + req.query["password"] +"\");";
  //insert new user to db
  connection.query(addNewUserQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send("Error executing query " + err);
      else
        return res.send(req.query["username"] + " added to db");
  });

});

//used for sending a message
app.post("/sendMessage",function(req,res) {

  if((typeof req.query["username"] === "undefined") || (typeof req.query["receiverName"] === "undefined") || (typeof req.query["message"] === "undefined"))
    return res.send("Error with inputs");
  var sendMessageQuery = "INSERT INTO messages(username, receiverName, message) VALUES (\"" + req.query["username"] + "\", \"" + req.query["receiverName"] + "\", \"" + req.query["message"] + "\");"

  //put message into databse
  connection.query(sendMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send("Error executing query " + err);
    else
      return res.send("Message sent to: " + req.query["receiverName"])
  });
});

//used for the client to retrieve their messages
app.get("/getMessages", function(req, res) {
  
  //if no id is provided end the request  
  if(typeof req.query["username"] === "undefined")
    return res.send("No user id provided");
  
  //execute the query in the db
  var getMessageQuery ="SELECT * FROM messages WHERE receiverName=\""+req.query["username"]+"\";";
  connection.query(getMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send("Error executing query " + err);
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
      //delete the messages from the database since they are being sent to user
      connection.query(deleteMyMessagesQuery, function(err, results, fields) {
        if(err)
          return res.send("Error executing query " + err);
        else
          //return json array of messages
          return res.json(jsonArray);
      });
    }
  });  
});

//used to verify if the user can sign into app
app.get("/signIn", function(req, res) {

  //check that the values were provided
  if((typeof req.query["username"] === "undefined") || (typeof req.query["password"] === "undefined"))
    return res.send("Error with inputs");
  //check here if password and username are the same in database, if they are then return success else nope
  var signInQuery="SELECT EXISTS (SELECT 1 FROM users WHERE username=\"" + req.query["username"] + "\" AND password=\"" + req.query["password"] + "\");";
  connection.query(signInQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send("Error executing query " + err);
    else
      if(results[0][signInQuery.substring(7, signInQuery.length - 1)])
        return res.send("Auth");
      else 
        return res.send("Fail");
  });


});


app.listen(8080, 'localhost',function(){
console.log('listening on 8080');

});

/*
put
localhost:8080/newuser?username=jynx&password=123qwerty
post
localhost:8080/sendMessage?username=jynx&receiverName=jane1&message=hey
get
localhost:8080/getMessages?username=jane1
get
localhost:8080/signIn?username=jane1&password=123qwerty


table users
userName VARCHAR(30) pk
password VARCHAR(255)

table messages
userName VARCHAR(30)fk
receiverName VARCHAR(30)
message id int auto increment pk
message varchar(500)
*/
