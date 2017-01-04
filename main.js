/*
JS Conversion of the python one I wrote

Clyde's Simple Shuffler Encryption

@Desc
This encryption algorthym is design for users to use their own keys to build
a unique encrypted output. It called shuffler as it uses the inputed key
to shuffle each character in the message, thus making it harder to crack.

I highly advise you to not use this for passwords. Paswords are secured by
hashing and not through encryption. Hashed values can't be decrypted where as
encryption can. Feel free to encrypt stuff for fun and use this as a learning
tool.

If you use this to encrypt something sensitive, use at your own discretion. I am
not responsible for messages you've created that's gotten cracked.

@author
Clyde Smets <clyde.smets@gmail.com>

@license
MIT

*/

const fs = require('fs')

const getKey = () => {
    const enc = fs.readSync('key/encoding.txt', 'utf8') 
    return enc
}

const encode = (message, options) => {
    const charList = message.split("")
    const binary = charList.map((char) => {
        const bin = char.charCodeAt(0).toString(2)
        return bin
    })
    const eightBitBin = binary.map((bits) => {
        const eightBit = recPrepend(8, bits, '0')
        return eightBit
    })
    const longBin = eightBitBin.join('')
    const blocks = longBin.match(/.{1,24}/g)
    const padNum = padCount(blocks[blocks.length - 1], 24)
    const fillBlock = fill(blocks[blocks.length - 1], 24)
    blocks[blocks.length - 1] = fillBlock
    const longPaddedBin = blocks.join('')
    const createGroups = ".{1," + options.size + "}"
    const re = new RegExp(createGroups, "g")
    const grouped = longPaddedBin.match(re)
    const fillGrp = fill(grouped[grouped.length - 1], options.size)
    grouped[grouped.length - 1] = fillGrp
    
    const numInGroup = (24 / options.size) >> 0

    const encoded = recEncodeGrp(
        grouped,
        numInGroup - 1,
        padNum,
        0,
        options
    )

    return encoded
}

const decode = (message, options) => {
    const chars = message.split("")
    const encDeci = chars.map((char) => {
        if (char === options.pad) {
            return char
        } else {
            return options.encoding.indexOf(char)
        }
    })
    const binary = encDeci.map((deci) => {
        if (deci === options.pad) {
            return options.pad
        } else {
            const bin = (deci >>> 0).toString(2)
            const completeBin = recPrepend(options.size, bin, '0')
            return completeBin
        }
    })
    const removePad = binary.filter((bin) => {
        return bin !== options.pad
    })
    const longBinary = removePad.join('')
    const decodedBinary = longBinary.match(/.{1,8}/g)
    const fillDecodedBinary = decodedBinary.map((bin) => {
        return recPrepend(8,bin,'0')
    })
    const removeNull = fillDecodedBinary.filter((bin) => {
        return bin !== '00000000'
    })
    const decodedDeci = removeNull.map((bin) => {
        return parseInt(bin, 2)
    })
    const decodedChar = decodedDeci.map((deci) => {
        return String.fromCharCode(deci)
    })
    console.log(decodedChar)
    const decoded = decodedChar.join('')
    return decoded
}

const recEncodeGrp = (grp, padGrp, padNum, index, opts) => {
    const padCutOff = grp.length - padGrp
    if (index < padCutOff) {
        grp[index] = encodeBits(grp[index], opts.encoding)
        return recEncodeGrp(grp, padGrp, padNum, index + 1, opts)
    } else if (index < grp.length){
        if (index >= (grp.length - padNum) && index < grp.length) {
            grp[index] = opts.pad
        } else {
            grp[index] = encodeBits(grp[index], opts.encoding)
        }
        return recEncodeGrp(grp, padGrp, padNum, index + 1, opts)
    } else {
        return grp.join('')
    }
}

const encodeBits = (bits, encoding) => {
    const index = parseInt(bits, 2)
    return encoding[index]
}

const fill = (bits, size) => {
    const filled = recAppend(size, bits, '0')
    return filled
}

const recAppend = (num, str, char) => {
    if (str.length < num) {
        const append = str + char
        return recAppend(num, append, char)
    } else {
        return str
    }
}

const recPrepend = (num, str, char) => {
    if (str.length < num) {
        const prepend = char + str
        return recPrepend(num, prepend, char)
    } else {
        return str
    }
}

const padCount = (bits, blockSize) => {
    if (bits.length < blockSize) {
        const count = blockSize / bits.length
        const blockBitSize = blockSize / 8
        const numOfPads = blockBitSize - Math.ceil(count)
        return numOfPads
    } else {
        return 0
    }
}

const resizeKey = (key, len) => {
    
}

const encrypt = (message, options) => {
    const encoded = encode(message, options)
    const encodedChar = encoded.split('')

    const getPadNum = () => {
        const pads = encodedChar.filter((char) => {
            return char === options.pad
        })

        return pads.length
    }

    const padNum = getPadNum()

    encodedChar.splice(encodedChar.length - padNum, padNum)

    console.log(encodedChar)
}

const o = {
    pad: "=",
    encoding: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    size: 6,
    key: '3924834902384'
}
const e = encrypt("Hello!! I'm a robot. Yahoo! wee poop.s", o)
