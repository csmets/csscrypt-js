/*
JS Conversion of the python one I wrote
https://github.com/csmets/CSSCrypt

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

const encode = (message, options) => {

    // Split message to individual characters for map binary conversion
    const charList = message.split("")

    // Convert characters to binary
    const binary = charList.map((char) => {
        const bin = char.charCodeAt(0).toString(2)
        return bin
    })

    // Make binary 8bit - sometimes a converted character spits only '0101' and
    // not the full 8bits.
    const eightBitBin = binary.map((bits) => {
        const eightBit = recPrepend(8, bits, '0')
        return eightBit
    })

    // Join the binary to one long string
    const longBin = eightBitBin.join('')

    // Split the long binary string into block of 24 used in encoding
    const blocks = longBin.match(/.{1,24}/g)

    // Get the number of pad characters it will need to add. AKA the '='
    // you famously see in base64
    const padNum = padCount(blocks[blocks.length - 1], 24)

    // Make last block size up to 24 bits
    const fillBlock = fill(blocks[blocks.length - 1], 24)
    blocks[blocks.length - 1] = fillBlock

    const longPaddedBin = blocks.join('')

    // Make new blocks of bits using specified encoding size
    const encBlockRegex = ".{1," + options.size + "}"
    const re = new RegExp(encBlockRegex, "g")
    const encBlocks = longPaddedBin.match(re)
    const fillBlock = fill(encBlocks[encBlocks.length - 1], options.size)
    encBlocks[encBlocks.length - 1] = fillBlock

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
    const decoded = decodedChar.join('')
    return decoded
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

const makeLength = (str, len) => {
    if (str.length < len) {
        return makeLength(str + str, len)
    } else {
        return str.substring(0,len)
    }
}

const resizeKey = (key, len) => {
    if (key.length > len) {
        return key.substring(0, len)
    } else {
        return makeLength(key, len)
    }
}

const shiftValue = (list, pos, num) => {
    const shift = pos + num
    if (shift < list.length) {
        return list[shift]
    } else {
        const remainder = list.length - (pos + 1)
        const wrappedShift = (num - remainder) - 1
        return list[wrappedShift]
    }
}

const getPadNum = (chars, pad) => {
    const pads = chars.filter((char) => {
        return char === pad
    })

    return pads.length
}

const encrypt = (message, options) => {
    const encoded = encode(message, options)
    const encodedChar = encoded.split('')


    const padNum = getPadNum(encodedChar, options.pad)

    encodedChar.splice(encodedChar.length - padNum, padNum)

    const key = resizeKey(options.key, encodedChar.length)

    const encodingList = options.encoding.split('')

    const shiftChars = (index, res) => {
        if (res.length > key.length - 1) {
            return res
        } else {
            const pos = options.encoding.indexOf(encodedChar[index])
            const shifted = shiftValue(encodingList, pos, parseInt(key[index]))
            return shiftChars(index + 1, res + shifted)
        }
    }
    const encrypted = shiftChars(0, '')
    
    const missingPads = encoded.slice(-padNum)

    return encrypted + missingPads
}

const unShiftValue = (list, pos, shift) => {
    index = pos - shift
    if (index < 0) {
        // Negative number
        return list.length - Math.abs(index)
    } else {
        return index
    }
}

const decrypt = (crypted, options) => {

    const cryptedChar = crypted.split('')
    const padNum = getPadNum(cryptedChar, options.pad)
    cryptedChar.splice(cryptedChar.length - padNum, padNum)

    // Resize the key
    const key = resizeKey(options.key, cryptedChar.length)
    const unshift = (index, res) => {
        if (res.length > key.length - 1) {
            return res
        } else {
            const pos = options.encoding.indexOf(cryptedChar[index])
            const unShiftIndex = unShiftValue(options.encoding, pos, 
                parseInt(key[index]))
            const unshifted = options.encoding[unShiftIndex]
            return unshift(index + 1, res + unshifted)
        }
    }

    const unshifted = unshift(0,'')
    const missingPads = crypted.slice(-padNum)
    const encoded = unshifted + missingPads
    const decrypted = decode(encoded, options)
    return decrypted
}

const o = {
    pad: "=",
    encoding: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    size: 6,
    key: '3924834902384'
}
const e = encrypt("Hello!! I'm a robot. Yahoo! wee poop.s", o)
console.log(e)
const d = decrypt(e, o)
console.log(d)
