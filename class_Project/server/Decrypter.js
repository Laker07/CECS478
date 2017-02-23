'use strict'

//module dependencies
var forge = require('node-forge');
var fileSystem = require('fs');



module.exports = {
    decryptMessage: function(JSONInput) {
        
       
        //console.log(fileSystem.existsSync("./../../private_key.pem"));        
        let privateKey = forge.pki.privateKeyFromPem(fileSystem.readFileSync("./../../../private_key.pem"));
        
        //change the key for rsaobject
        let decryptedRSA = privateKey.decrypt(JSONInput['rsaCipher'], 'RSA-OAEP');
        let aesKey = decryptedRSA.substring(0, 32);
        let hmacKey = decryptedRSA.substring(32);
        
        let hmac = forge.hmac.create();
        hmac.start('sha256', hmacKey);
        hmac.update(JSONInput['aesCipher']);

        if(JSONInput['hmacTag'] != hmac.digest().toHex())
            throw "ERROR WITH THE TAGS";
       


        
        let decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        let iv = JSONInput['aesCipher'].substring(0, 16);
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(JSONInput['aesCipher'].substring(16)));
        decipher.finish();
        
        return decipher.output.toString();
    }
    
};








