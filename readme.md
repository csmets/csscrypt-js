# CSSCrypt

Clyde’s Simple Shuffler Encryption. Encryption which requires two keys to encrypt and decrypt. First key is used to encode the message. Second one, shifts each encrypted character according to each single digit in the key.

Note: This is a rewrite of a script I did in [Python](https://github.com/csmets/CSSCrypt)

## Usage
```javascript
const CSSCrypt = require ('./csscrypt')

const options = {
    key: '3924834902384'
    encoding: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    pad: "=",
    bitSize: 6,
}

const e = CSSCrypt.encrypt("Hello!! I'm a robot. Yahoo!", options)
console.log(e)

const d = CSSCrypt.decrypt(e, o)
console.log(d)
```

`key` is the shift key, which can be anything length and you could use an RSA key if you wanted. String value is required. 

`encoding` are the characters that are used to replace the original message. Characters must be unique. Default uses Base64, but it's best to create your own. Note that it should be 64 characters long.

`pad` a unique value that is used to indicate the decryption to know how much padding is invovled. Default value is `=`

`bitSize` this is the bit size used for encoding. Default value is `6`.
