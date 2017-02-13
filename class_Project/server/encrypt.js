
var crypto = require('crypto')

var text = "Test text, ha!"
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)
	//for a list of aes options
	//gist.github.com/reggi/4459803 
const algo = 'aes-256-cbc'

//not sure if to take these vars or  do 
//encrypt(text

//todo - return a json obj
function encrypt(text, key, iv){	
	//encrypt
	let cipher = crypto.createCipheriv(algo, key, iv)
	//cipher.update(data, input incoding, output encoding)
	let encrypt = cipher.update(text, 'utf8', 'hex')
	encrypt += cipher.final('hex')

	//not sure if 'run on your ciphertext to compute integrity'
	let hmac = crypto.createHmac('sha256', 'somekey?')
	hmac.update('some data to hash')




	console.log("encrypt: " + encrypt)
	console.log("key: " + key)
	console.log("iv: " + iv)

}

encrypt("hello", key, iv)

