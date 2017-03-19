var express = require("express");
var mysql = require('mysql');
var fileSystem = require('fs');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
//makes it easy to parse json sent from android client
var bodyParser = require('body-parser');
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : '',
   database : 'ServerDB2'
 });

var secretTxt = fileSystem.readFileSync('secret.txt', 'utf8');
var app = express();

app.use(expressJWT({secret: secretTxt }).unless({path:['/','/signIn','/register']}));
var jsonParser = bodyParser.json()

app.use(jsonParser);


app.post('/register', function (req, res) {
  if (!req.body) return res.sendStatus(400);
  if(!req.body.username) return res.sendStatus(400);
  if(!req.body.password) return res.sendStatus(400);
  if(req.body.username.length < 1) return res.sendStatus(400);
  if(req.body.password.length < 1) return res.sendStatus(400);
  
  var addNewUserQuery = "INSERT INTO users (username, password) VALUES (\"" + req.body.username + "\", \"" + req.body.password +"\");";
    
  connection.query(addNewUserQuery, function(err, results, fields) {
    if (err){
    //to sends client invalid message - parsed to let user know to try a diff name/pwd
      console.log("SQL Error : " + err);
      return res.send({'response ': 'invalid',
                       'message': 'Invalid entry',
                       'jwt': ""});
    }else {
    //create jwt token
      console.log(req.body.username +" has just registered...");
      //token is encoded with hmac SHA256 by default
      var jwtToken = jwt.sign({'username': req.body.username}, secret);
      res.send(
        {'response': 'Success', 
         'message': "JWT token generated and user register", 
         'jwt':jwtToken
       });   
    }
  })
})


app.get("/", function(req,res){

 res.send("welcome to cecs.me");
});

//used to verify if the user can sign into app
app.post("/signIn", function(req, res) {

  if (!req.body) return res.sendStatus(400);
  if(!req.body.username) return res.sendStatus(400);
  if(!req.body.password) return res.sendStatus(400);
 
  console.log("this is the username :"+ req.body.username )
  //check here if password and username are the same in database
  var signInQuery="SELECT EXISTS (SELECT 1 FROM users WHERE username=\"" + req.body.username + "\" AND password=\"" + req.body.password + "\");";
  connection.query(signInQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send({'response': 'Error', 'error': err});
    else
      if(results[0][signInQuery.substring(7, signInQuery.length - 1)]) {
        //create jwt token
        //token is encoded with hmac SHA256 by default
        var jwtToken = jwt.sign({'username': req.body.username}, secret);
        res.send(
            {'response': 'Success', 
             'message': "JWT token generated and user signed in", 
             'jwt':jwtToken
           });
        console.log(req.body.username + " : logged in...")   
      }
      else 
        return res.send(
            {'response': 'invaliddat',
            'message': 'Incorrect username or password',
            'jwt': ""
          });
    });
});


//used for sending a message
app.post("/sendMessage",function(req,res) {

/*
{
  String id;
  String text;
  String user;
  Date date;
  String jwt;
*/
 console.log("was able to access!!")
/*
  //check the parameters 
  if(!req.body.text)
      res.status(400).send('text message required');
  if(req.body.text.length === 0)
       res.status(400).send('text message can not be empty');
    //load secret

  // var decoded ="";
  // try {//verify the token
  //   decoded = jwt.verify(req.query['token'], secret);
  // } catch (Error) {//does not pass the verification, exit method
  //   return res.send({'response': 'Error', 'error': "error"});
  // }
  //data is in a json object so pare its
  var userInput = JSON.parse(req.query["data"]);

  var sendMessageQuery = "INSERT INTO messages(username, receiverName, message, timestamp) VALUES (\"" + decoded['username'] + "\", \"" + userInput["receiverName"] + "\", \"" + userInput["message"] + "\", \"" + userInput["timeStamp"] + "\");";

  //put message into databse
  connection.query(sendMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send({'response': 'Error', 'error': err});
    else
      return res.send({'response': 'Success', 'Message': "Message sent to " + userInput["receiverName"]});
  });  */
});

//used for the client to retrieve their messages
app.get("/getMessages", function(req, res) {
  
  //if no id is provided end the request  
  if(typeof req.query["token"] === "undefined")
    return res.send({'response': 'Error', 'error': "wrong inputs"});
  
  //open the secret
  var secret = fileSystem.readFileSync('secret.txt', 'utf8');

  var decoded ="";
  try {//verify the jwt token
    decoded = jwt.verify(req.query['token'], secret);
  } catch (Error) {//does not pass the verification, exit method
    return res.send({'response': 'Error', 'error': "error"});
  }
  
  //execute the query in the db
  var getMessageQuery ="SELECT * FROM messages WHERE receiverName=\""+decoded["username"]+"\";";
  connection.query(getMessageQuery, function(err, results, fields) {
    if (err)
      //error occures, exit function
      return res.send({'response': 'Error', 'error': err});
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
          return res.send({'response': 'Error', 'error': err});
        else
          //return json array of messages
          return res.json({'response': 'Success', 'messagecount': i, "messages": jsonArray});
      });
    }
  });  
 
});



app.listen(8081, 'localhost',function(){
console.log('listening on 8081');

});

/*
NOTES:
register - post
localhost:8080/register?data={"username":"34545", "password":"unknown"}
signIn - get
localhost:8080/signIn?data={"username":"34545", "password":"unknown"}
localhost:8080/signIn?data={"username":"chrome24", "password":"mike"}
sendMessage - post
localhost:8080/sendMessage?token=TOKENGOESHERE&data={"receiverName":"chrome24", "message":"hello, test message", "timeStamp":"2017-03-16 02:23:53"}
getMessage - get
localhost:8080/getMessages?token=TOKENGOESHERE
adding messages to db
INSERT INTO messages(username, receiverName, message, timestamp) 
VALUES ("34545", "34545", "somemessage", '2017-03-16 02:23:53');
create random characters for secret
openssl rand -out secret.txt -base64 100
*/