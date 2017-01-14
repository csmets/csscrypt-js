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

const defaultOptions = (options) => {
    // Default options follow Base64 encryption
    options.bitSize = options.bitSize || 6
    options.pad = options.pad || '='
    options.encoding = options.encoding
    || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    return options
}

const optionsKeyCheck = (options) => {  
    if (options.key === undefined) {
        throw "Key has not been entered"
    }
    return options
}

const encrypt = (message, options) => {

    // Check options object and setup any required default values
    options = defaultOptions(optionsKeyCheck(options))

    // Encode the message
    const encoded = encode(message, options)
    
    // Split the encoded message to manipulate individual values
    const encodedChar = encoded.split('')

    // Get the number of padding values found the in encoded message
    const padNum = getPadNum(encodedChar, options.pad)

    // Remove the pad characters
    encodedChar.splice(encodedChar.length - padNum, padNum)

    // Resize the shift key to match the encoded message length
    const key = resizeKey(options.key, encodedChar.length)

    // Split the encoded message so we can shift each character
    const encodingList = options.encoding.split('')

    const shiftChars = (index, res) => {
        if (res.length > key.length - 1) {
            return res
        } else {
            const pos = options.encoding.indexOf(encodedChar[index])
            const shifted = shiftChar(encodingList, pos, parseInt(key[index]))
            return shiftChars(index + 1, res + shifted)
        }
    }
    const encrypted = shiftChars(0, '')
    
    const missingPads = encoded.slice(-padNum)

    return encrypted + missingPads
}

const decrypt = (crypted, options) => {

    const cryptedChar = crypted.split('')

    const padNum = getPadNum(cryptedChar, options.pad)

    // Remove pad characters
    cryptedChar.splice(cryptedChar.length - padNum, padNum)

    // Resize the shift key
    const key = resizeKey(options.key, cryptedChar.length)

    // Unshift each character in the encrpyted message with the key so the
    // result should be a message that is almost ready to be decoded.
    const unshift = (index, res) => {
        if (res.length > key.length - 1) {
            return res
        } else {
            const pos = options.encoding.indexOf(cryptedChar[index])
            const unShiftIndex = unShiftChar(options.encoding, pos, 
                parseInt(key[index]))
            const unshifted = options.encoding[unShiftIndex]
            return unshift(index + 1, res + unshifted)
        }
    }
    const unshifted = unshift(0,'')

    // Get ony the pad value from the encrypted message. (It's the only value
    // that is non shifted.
    const missingPads = crypted.slice(-padNum)

    // Now we have the encoded message ready to be decoded.
    const encoded = unshifted + missingPads
    const decrypted = decode(encoded, options)

    return decrypted
}

const encode = (message, options) => {

    // Split message to individual characters for map binary conversion
    const charList = message.split("")

    // Convert characters to binary
    const binary = charList.map((char) => {
        const bin = char.charCodeAt(0).toString(2)
        return bin
    })

    // Make binary 8bit (octet) - sometimes a converted character spits only 
    // '0101' and not the full 8bits.
    const makeOctet = binary.map((bits) => {
        const octet = recPrepend(8, bits, '0')
        return octet
    })

    // Join the binary to one long string
    const longBin = makeOctet.join('')

    // Split the long binary string into block of 24 used in encoding
    const blocks = longBin.match(/.{1,24}/g)

    // Get the number of pad characters it will need to add. AKA the '='
    // you famously see in base64
    const padNum = padCount(blocks[blocks.length - 1], 24)

    // Make last block size up to 24 bits
    const fillBlock = fill(blocks[blocks.length - 1], 24)
    blocks[blocks.length - 1] = fillBlock

    const longPaddedBin = blocks.join('')

    // Make new groups of bits using specified encoding size
    const encGrpRegex = ".{1," + options.bitSize + "}"
    const re = new RegExp(encGrpRegex, "g")
    const encGrps = longPaddedBin.match(re)
    const fillGrp = fill(encGrps[encGrps.length - 1], options.bitSize)
    encGrps[encGrps.length - 1] = fillGrp

    // Find the number of groups that is required to make a block
    const numInGroup = (24 / options.bitSize) >> 0

    // Assign an encoding character to the encoded bits of data
    const encoded = recEncodeGrp(
        encGrps,
        numInGroup - 1,
        padNum,
        0,
        options
    )

    return encoded
}

// Recursive function that will loop through groups of bits and assign them a
// encode character. It will stop once it exceeds group length.
const recEncodeGrp = (grp, padGrp, padNum, index, opts) => {

    const padCutOff = grp.length - padGrp

    // Apply the encoded value
    if (index < padCutOff) {
        grp[index] = encodeBits(grp[index], opts.encoding)
        return recEncodeGrp(grp, padGrp, padNum, index + 1, opts)
    } 
    // If it's on the last group check if value is a pad or encoding char
    else if (index < grp.length){
        if (index >= (grp.length - padNum) && index < grp.length) {
            grp[index] = opts.pad
        } else {
            grp[index] = encodeBits(grp[index], opts.encoding)
        }
        return recEncodeGrp(grp, padGrp, padNum, index + 1, opts)
    } 
    // Return the final result as a string
    else {
        return grp.join('')
    }
}

// Find the decimal value of the bits to get the index position of the encoded
// chracter.
const encodeBits = (bits, encoding) => {
    const index = parseInt(bits, 2)
    return encoding[index]
}

const decode = (message, options) => {
    
    const chars = message.split("")
    
    // Get the decimal value of the message characters
    const encDeci = chars.map((char) => {
        if (char === options.pad) {
            return char
        } else {
            return options.encoding.indexOf(char)
        }
    })

    // Convert the decimal values into binary
    const binary = encDeci.map((deci) => {
        if (deci === options.pad) {
            return options.pad
        } else {
            const bin = (deci >>> 0).toString(2)
            const completeBin = recPrepend(options.bitSize, bin, '0')
            return completeBin
        }
    })

    // Return an array without pad characters
    const removePad = binary.filter((bin) => {
        return bin !== options.pad
    })

    // Make encoded binary into groups of heximal safe binary
    const longBinary = removePad.join('')
    const decodedBinary = longBinary.match(/.{1,8}/g)
    const fillDecodedBinary = decodedBinary.map((bin) => {
        return recPrepend(8,bin,'0')
    })

    // Remove any null type binary
    const removeNull = fillDecodedBinary.filter((bin) => {
        return bin !== '00000000'
    })

    // Return decoded character decimal values
    const decodedDeci = removeNull.map((bin) => {
        return parseInt(bin, 2)
    })

    // Convert the character decimal into a character which will result into
    // the decoded message.
    const decodedChar = decodedDeci.map((deci) => {
        return String.fromCharCode(deci)
    })
    const decoded = decodedChar.join('')

    return decoded
}

// Return a '000110' (6 bit) to a '00011000' (8bit) if size value is given 8
const fill = (bits, size) => {
    const filled = recAppend(size, bits, '0')
    return filled
}

// Append a character to a string by a number of times
const recAppend = (num, str, char) => {
    if (str.length < num) {
        const append = str + char
        return recAppend(num, append, char)
    } else {
        return str
    }
}

// Prepend a character to a tring by a number of times
const recPrepend = (num, str, char) => {
    if (str.length < num) {
        const prepend = char + str
        return recPrepend(num, prepend, char)
    } else {
        return str
    }
}

// Count the number of padding within a block
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

// Make a string stretch out to the length given by wrapping.
// e.g. 'ABC' make len=6  = 'ABCABC'
const makeLength = (str, len) => {
    if (str.length < len) {
        return makeLength(str + str, len)
    } else {
        return str.substring(0,len)
    }
}

// Resize the shift key to the length given
const resizeKey = (key, len) => {
    if (key.length > len) {
        return key.substring(0, len)
    } else {
        return makeLength(key, len)
    }
}

// Return a character that's x num in front of the original
const shiftChar = (list, pos, num) => {
    const shift = pos + num
    if (shift < list.length) {
        return list[shift]
    } else {
        const remainder = list.length - (pos + 1)
        const wrappedShift = (num - remainder) - 1
        return list[wrappedShift]
    }
}

// Return a chracter that's x num behind of the original
const unShiftChar = (list, pos, num) => {
    index = pos - num
    if (index < 0) {
        // Negative number
        return list.length - Math.abs(index)
    } else {
        return index
    }
}

// Return the number of characters that match the pad char
const getPadNum = (chars, pad) => {
    const pads = chars.filter((char) => {
        return char === pad
    })

    return pads.length
}

module.exports = {
    encrypt,
    decrypt
}
