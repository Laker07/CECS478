

var forge = require('node-forge')
var fs = require('fs')

const rsak = fs.readFileSync(__dirname + '/../../../public_key.pem', 'utf8')

let aesKey = forge.random.getBytesSync(32);
let hmacKey = forge.random.getBytesSync(32);




module.exports = {
	encrypt:function(text) {
		
		//AES ENC	
		let iv = forge.random.getBytesSync(16);
		let cipher = forge.cipher.createCipher('AES-CBC', aesKey);
		cipher.start({iv:iv});
		
		cipher.update(forge.util.createBuffer(text));
		cipher.finish();
		aesEncrypted = cipher.output.getBytes();

		//aesEcrypted plus IV
		aesPlusIV = iv+aesEncrypted;
		
		//hmac
		let hmac = forge.hmac.create();
		hmac.start('sha256', hmacKey);
		hmac.update(aesPlusIV);
		let tag = hmac.digest().toHex();
		//console.log(tag.toHex())

		//rsa
		var publicKey = forge.pki.publicKeyFromPem(rsak);
		let combined = aesKey+hmacKey;
		var rsaCipher = publicKey.encrypt(combined, 'RSA-OAEP');
		//console.log(rsaCipher)


		var obj = {
			aesCipher : aesPlusIV,
			hmacTag : tag,
			rsaCipher : rsaCipher
		}

		return obj;
	}
}