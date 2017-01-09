const CSSCrypt = require ('./csscrypt')

const o = {
    pad: "=",
    encoding: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    size: 6,
    key: '3924834902384'
}
const e = CSSCrypt.encrypt("Hello!! I'm a robot. Yahoo! wee poop.s", o)
console.log(e)
const d = CSSCrypt.decrypt(e, o)
console.log(d)
