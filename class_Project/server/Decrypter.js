'use strict'

//module dependencies
var forge = require('node-forge');
var fileSystem = require('fs');



module.exports = {
    decryptMessage: function(JSONInput) {
        
       
              
        let privateKey = forge.pki.privateKeyFromPem(fileSystem.readFileSync("./../../../private_key.pem"));
        
        //Dectyptes the rsa, the first 32 bytes are the aes key and the remaining 32 are the hmac key
        let decryptedRSA = privateKey.decrypt(JSONInput['rsaCipher'], 'RSA-OAEP');
        let aesKey = decryptedRSA.substring(0, 32);
        let hmacKey = decryptedRSA.substring(32);
        
        //create our own hmac
        let hmac = forge.hmac.create();
        hmac.start('sha256', hmacKey);
        hmac.update(JSONInput['aesCipher']);

        //if they do not match, then an error has occured
        if(JSONInput['hmacTag'] != hmac.digest().toHex())
            throw "ERROR WITH THE TAGS";
       
        //create a aes decipher, iv is the first 16 bytes of the aes cipher,
        //the remaning bytes are the ciphertext
        let decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        let iv = JSONInput['aesCipher'].substring(0, 16);
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(JSONInput['aesCipher'].substring(16)));
        decipher.finish();
        
        return decipher.output.toString();
    }
    
};








