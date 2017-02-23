var dec = require('./Decrypter.js');
var enc = require('./forgeEnc.js');
//test json object

console.log(dec.decryptMessage(enc.encrypt("hello")));