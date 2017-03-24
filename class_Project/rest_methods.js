const CREATED_TOKEN_STATUS = 201;
const SUCCESS_STATUS = 200;
const ERROR_STATUS = 400; 
const JWT_EXPIRATION_TIME = '5h';
const SERVER_PORT = 8080;
const STARTING_POSITION_OF_INNER_QUERY = 7

var express = require("express");
var mysql = require('mysql');
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : '',
   database : 'ServerDB2'
 });
var fileSystem = require('fs');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var app = express();

app.get("/", function(req,res){

 res.send("welcome to cecs.me");
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var secret = fileSystem.readFileSync('secret.txt', 'utf8');
app.post("/register", function(req, res) {
  
  //check if data was supplied
  if(!req.body)
    return res.status(ERROR_STATUS).send({'response': 'Error', 'error': 'Parameter is undefined'});

  var addNewUserQuery = "INSERT INTO users (username, password) VALUES (\"" + req.body.username + "\", \"" + req.body.password +"\");";
  connection.query(addNewUserQuery, function(err, results, fields) {
    if (err)
      //error occured, exit function
      return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "DB `Error: " + err});
    else {
      //create jwt token
      var secret = fileSystem.readFileSync('secret.txt', 'utf8');
      //token is encoded with hmac SHA256 by default
      var jwtToken = jwt.sign({'username': req.body.username}, secret, { expiresIn: JWT_EXPIRATION_TIME});
      return res.status(CREATED_TOKEN_STATUS).send({'response': 'Success', 'message': "JWT token generated and user register", 'jwtToken':jwtToken});   
    }
  });
});

//used to verify if the user can sign into app
app.post("/signIn", function(req, res) {

  //check if the parameter data was supplied
  if(!req.body)
    return res.status(ERROR_STATUS).send({'response': 'Error', 'error': 'Parameter is undefined'});
  
  //check here if password and username are the same in database
  var signInQuery="SELECT EXISTS (SELECT 1 FROM users WHERE username=\"" + req.body.username + "\" AND password=\"" + req.body.password + "\");";
  connection.query(signInQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "DB Error: " + err});
    else//db returns results in an index that is titled the query
      if(results[0][signInQuery.substring(STARTING_POSITION_OF_INNER_QUERY, signInQuery.length - 1)]) {
        //create jwt token
        var secret = fileSystem.readFileSync('secret.txt', 'utf8');
        //token is encoded with hmac SHA256 by default     CHANGEMEBACK
        var jwtToken = jwt.sign({'username': req.body.username}, secret, { expiresIn: JWT_EXPIRATION_TIME});
        return res.status(CREATED_TOKEN_STATUS).send({'response': 'Success', 'message': "JWT token generated and user signed in", 'jwtToken':jwtToken});   
      }
      else 
        return res.status(ERROR_STATUS).send({'response': 'Error', 'error': 'Incorrect username or password'});
  });
});


//used for sending a message
app.post("/sendMessage",function(req,res) {

  //check the parameters 
  if(!req.body || !req.headers["token"])
    return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "Wrong inputs"});

  var decoded ="";
  try {//verify the token
    decoded = jwt.verify(req.headers["token"], secret);
  } catch (Error) {//does not pass the verification, exit method
    return res.status(ERROR_STATUS).send({'response': 'Error', 'error': Error});
  }
  //data is in a json object so pare its

  var sendMessageQuery = "INSERT INTO messages(username, receiverName, message, timestamp) VALUES (\"" + decoded['username'] + "\", \"" + req.body.receiverName + "\", \"" + req.body.message + "\", \"" + req.body.timeStamp + "\");";

  //put message into databse
  connection.query(sendMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "DB Error: " + err});
    else
      return res.status(SUCCESS_STATUS).send({'response': 'Success', 'Message': "Message sent to " + req.body.receiverName});
  });
});

//used for the client to retrieve their messages
app.get("/getMessages", function(req, res) {
  

  //if no id is provided end the request  
  if(typeof req.headers["token"] === "undefined")
    return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "Wrong inputs"});
  

  var decoded ="";
  try {//verify the jwt token
    decoded = jwt.verify(req.headers['token'], secret);
  } catch (Error) {//does not pass the verification, exit method
    return res.status(ERROR_STATUS).send({'response': 'Error', 'error': Error});
  }

  //execute the query in the db
  var getMessageQuery ="SELECT * FROM messages WHERE receiverName=\""+decoded["username"]+"\";";
  connection.query(getMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "DB Error: " + err});
    else {
      var jsonArray = new Array();
      //user can have multiple messages waiting for them so create an array to store them all
      for (var i  = 0; i < results.length; i++) {
        //put each message with the users 
        jsonArray[i] = {
          message:results[i]["message"],
          sender:results[i]["username"],
          timestamp:results[i]["timestamp"]
        }  
      }
      
      var deleteMyMessagesQuery = "DELETE FROM messages WHERE receiverName=\""+ decoded["username"]+"\";";
      //delete the messages from the database since they are being sent to user
      connection.query(deleteMyMessagesQuery, function(err, results, fields) {
        if(err)
          return res.status(ERROR_STATUS).send({'response': 'Error', 'error': "DB Error: " + err});
        else
          //return json array of messages
          return res.status(SUCCESS_STATUS).json({'response': 'Success', 'messagecount': i, "messages": jsonArray});
      });
    }
  });  
});



app.listen(SERVER_PORT, 'localhost',function(){
console.log('listening on 8080');

});