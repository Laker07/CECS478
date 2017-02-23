var dec = require('./Decrypter.js');

//test json object
var input = '{"firstName":"John", "lastName":"Doe"}';

console.log(dec.decryptMessage(input));