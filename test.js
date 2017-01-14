const CSSCrypt = require ('./csscrypt')

const o = {
    key: '3924834902384'
}
const e = CSSCrypt.encrypt("Hello!! I'm a robot. Yahoo! wee poop.s", o)
console.log(e)
const d = CSSCrypt.decrypt(e, o)
console.log(d)
