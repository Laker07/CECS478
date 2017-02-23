
'use strict'



//module dependencies
var forge = require('node-forge');
var fileSystem = require('fs');

//test json object
//var input = '{"firstName":"John", "lastName":"Doe"}';

//var test = JSON.parse(input);
//console.log(test["firstName"]);


module.exports = {
    decryptMessage: function(JSONInput) {
        
        let parsedInput = JSON.parse(JSON.stringify(JSONInput));

        //console.log(fileSystem.existsSync("./../../private_key.pem"));        
        let privateKey = forge.pki.privateKeyFromPem(fileSystem.readFileSync("./../../private_key.pem"));
        
        //change the key for rsaobject
        let decryptedRSA = privateKey.decrypt(parsedInput['rsaCipher']);
        let aesKey = decryptedRSA.substring(0, 32);
        let hmacKey = decryptedRSA.substring(32);
        
        let hmac = forge.hmac.create();
        hmac.start('sha256', hmacKey);
        hmac.update(parsedInput['aesCipher']);

        if(parsedInput['hmacTag'] != hmac.digest().toHex())
            throw "ERROR WITH THE TAGS";
       
        let decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        let iv = parsedInput['aesCipher'].substring(0, 16);
        decipher.start({iv: iv});
        decipher.update(parsedInput['aesCipher'].substring(16));
        //decipher.finish();
        
        //return decipher.output.toHex();
        return "test";
    }
    
};








