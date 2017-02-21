
/* 

rsa 2048 
aes 64
hmac 64
iv 32

*/



var crypto = require('crypto') //publicc RSA  - for public encryp and pri decription
var fs = require('fs')
var constants = require('constants')
//some file to place key

//maybe use path and go files backwards!!!
//this needs to change to a better whay of calling this file
const rsak = fs.readFileSync('/public_key.pem', 'utf8')
console.log(rsak);


var text = "Test text, ha!"
const hmacKey = crypto.randomBytes(64).toString('utf8')
const aesKey = crypto.randomBytes(64).toString('utf8') //aes and hmac 64

	//for a list of aes options
	//gist.github.com/reggi/4459803 
const algo = 'aes256'

//not sure if to take these vars or  do 
//encrypt(text

//todo - return a json obj
function encrypt(text){	
	let iv = crypto.randomBytes(16)

	//cipher object

	//need some IV!!!!!!!!!!!!



	//let cipher = crypto.createCipheriv(algo, aesKey, iv)
	let cipher = crypto.createCipher(algo, aesKey)
	let aesEnc = cipher.update(text)
	aesEnc += cipher.final('hex')

	
	let tag = crypto.createHmac('sha256', hmacKey)
	tag.update(aesEnc).digest('hex')

	//keys
	let keys = aesKey + ":" + hmacKey
	//r encryptStringWithRsaPublicKey = function(toEncrypt, relativeOrAbsolutePathToPublicKey) {
   // var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
    //var publicKey = fs.readFileSync(absolutePath, "utf8");
    
    var buffer = new Buffer(keys);
    var rsaEnc = crypto.publicEncrypt({"key":rsak,padding:constants.RSA_PKCS1_PADDING},  
    	buffer).toString("hex");


	console.log("aes : " + aesEnc)
	console.log("hmac: " + tag)
	console.log("rsa : " + rsaEnc)

	var obj ={
		aesCipher : aesEnc,
		hmacTag : tag,
		rsaCipher : rsaEnc
	}

	return obj;
}

encrypt("hello")

